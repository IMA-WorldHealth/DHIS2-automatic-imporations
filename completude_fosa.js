const _ = require('lodash');
const fs = require('fs');
const qs = require('querystring');
const API = require('./lib/dhis2-api');
const mailer = require('./mailer');
module.exports.postData = async (auth) => {
  const api = new API({
    credentials: auth,
    url: 'https://ima-assp.org/api/analytics/dataValueSet.json',
  });

  const PERIOD = 'LAST_MONTH';
  //const PERIOD = '202007';
  const query = `dimension=dx:DQiMxAlXTOe&dimension=pe:${PERIOD}&dimension=qRZwzI8PYTJ:XZqSZpJycKJ&dimension=ou:LEVEL-5;s7ZjqzKnWsJ&displayProperty=NAME`;

  const orgUnitURL = 'https://ima-assp.org/api/organisationUnits';
  const orgUnitQuery = 'fields=id,name,dataSets[id,name]&filter=dataSets.id:in:[zdGNLhp4xAB,pJxcWVobpl2]&paging=false';

  try {
    const [{ dataValues }, { organisationUnits }] = await Promise.all([
      api.analytics({ query }),
      api.analytics({ url: orgUnitURL, query: orgUnitQuery }),
    ]);

    // regroupons les donnees par period
    const dataMap = _.groupBy(dataValues, 'period');

    // only select the lines with value greater than 0.
    _.map(dataMap, (values) => values.filter((row) => row.value > 0));

    const datasetUUID = ['zdGNLhp4xAB', 'pJxcWVobpl2'];
    const datasetMap = {};

    // maps org units to datasets
    organisationUnits.forEach((orgUnit) => {
      const datasets = orgUnit.dataSets;
      datasets.forEach((dataset) => {
        if (datasetUUID.includes(dataset.id)) {
          datasetMap[orgUnit.id] = dataset.id;
        }
      });
    });

    fs.writeFileSync('organisationUnits.json', JSON.stringify(organisationUnits), 'utf8');

    const dataSet = 'pMbC0FJPkcm';

    const completedDatasetAPI = new API({
      credentials: auth,
      url: 'https://snisrdc.com/api/completeDataSetRegistrations.json',
    });

    const requests = _.flatMap(dataMap, (values, period) => {
      const { startDate, endDate } = computePeriodDates(period);

      const orgUnit = _.map(values, (row) => row.orgUnit);

      // create chunks of 35 org units a piece
      const chunks = _.chunk(orgUnit, 35);

      const promises = chunks.map((chunk) => {
        const queryString = qs.stringify({
          dataSet, startDate, endDate, orgUnit: chunk,
        });

        return completedDatasetAPI.analytics({ query: queryString });
      });

      return promises;
    });

    const promises = await Promise.all(requests);

    const completed = _
      .flatMap(promises, (ds) => ds.completeDataSetRegistrations);

    const completeDataSetRegistrations = completed.map((ligne) => ({
      ...ligne,
      dataSet: datasetMap[ligne.organisationUnit],
      attributeOptionCombo: 'c6PwdArn3fZ',
    }));
    fs.writeFileSync('./completude_fosa.json', JSON.stringify(completeDataSetRegistrations));
    await api.postData({
      data: { completeDataSetRegistrations },
      url: 'https://ima-assp.org/api/completeDataSetRegistrations',
    });

    await mailer.sendMail(
      'success!!! Import Completness for FOSA',
      'Import Completness for FOSA',
    );
  } catch (err) {
    await mailer.sendMail(
      `Fail!!! Import Completness for FOSA${JSON.stringify(err)}`,
      'Fail!!! Import Completness for FOSA',
    );
  }
};

function computePeriodDates(period) {
  const justYear = period.substr(0, 4);
  const justMonth = parseInt(period.substr(4, 6), 10);

  const date = new Date(justYear, justMonth - 1, 1);
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  let getMois;
  if ((`${lastDay.getMonth() + 1}`).length < 2) {
    getMois = `0${(lastDay.getMonth() + 1).toString()}`;
  } else {
    getMois = lastDay.getMonth() + 1;
  }

  const startDate = `${firstDay.getFullYear()}-${getMois}-0${firstDay.getDate()}`;
  const endDate = `${lastDay.getFullYear()}-${getMois}-${lastDay.getDate()}`;

  return { startDate, endDate };
}