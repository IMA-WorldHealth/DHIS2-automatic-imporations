const API = require('./lib/dhis2-api');
const mailer = require('./mailer');

module.exports.postData = (auth) => {
  // const url = `https://ima-assp.org/api/analytics/dataValueSet.json`;

  const api = new API({
    credentials: auth,
    // url: url
    url: 'https://ima-assp.org/api/analytics/dataValueSet.json',
  });
    // Données éxistantes de la complétude HGR
    /*
    const apiHGR = new API({
        credentials: auth,
        url: url
    });
*/
  const query = 'dimension=dx:pJxcWVobpl2.ACTUAL_REPORTS&dimension=ou:LEVEL-3;s7ZjqzKnWsJ&dimension=pe:THIS_QUARTER;LAST_QUARTER&displayProperty=NAME';

  // //Données éxistantes de la complétude HGR
  // const queryHGR = `dimension=pe:THIS_QUARTER;LAST_QUARTER&dimension=ou:LEVEL-3;s7ZjqzKnWsJ&dimension=dx:fQAidw8S5ud&displayProperty=NAME`;

  // download the Data
  api.analytics({ query })
    .then((source) => {
      const { dataValues } = source;

      const result = {
        dataValues: [],
      };
      const completude = 'fQAidw8S5ud';

      datasetMap = {};

      dataValues.forEach((source) => {
        // console.log('source element : ', source);
        const data = Math.round(source.value / 3);
        result.dataValues.push({
          dataElement: completude,
          period: source.period,
          orgUnit: source.orgUnit,
          value: data,
          storedBy: `IMA ${source.created}`,
          created: source.created,
        });
      });

      // console.log(result);

      return api.postData({
        data: result,
        // url: 'https://ima-assp.org/api/dataValueSets?importStrategy=CREATE'
        url: 'https://ima-assp.org/api/dataValueSets?skipAudit=true',
      });
    })
    .then((response) => {
      mailer.sendMail(`success!!! Import Completness for HGR${JSON.stringify(response)}`, 'Import Completness for HGR');
    }).catch((err) => {
      mailer.sendMail(`Fail!!! Import Completness for HGR${JSON.stringify(err)}`, 'Fail!!! Import Completness for HGR');
    });
};
