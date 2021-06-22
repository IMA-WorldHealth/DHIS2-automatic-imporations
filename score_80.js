const fs = require('fs');
const _ = require('lodash');
const mailer = require('./mailer');
const API = require('./lib/dhis2-api');

module.exports.postData = (auth) => {
  const result = { dataValues: [] };
  const api = new API({
    credentials: auth,
    url: 'https://ima-assp.org/api/analytics/dataValueSet.json',
  });

  const query = 'dimension=dx:kSZql3OdY28&dimension=pe:LAST_4_QUARTERS&dimension=ou:LEVEL-3;D15NtionqkH;I8CuQpdBQfP;iu4Zj3Zq39m&displayProperty=NAME';
  // const query = `dimension=dx:kSZql3OdY28&dimension=pe:LAST_QUARTER&dimension=ou:LEVEL-3;D15NtionqkH;I8CuQpdBQfP;iu4Zj3Zq39m&displayProperty=NAME`;
  // download the Data
  api.analytics({
    query,
  })
    .then((source) => {
      const { dataValues } = source;

      const score80 = 'Lceopb5AECI';

      const orgs = _.groupBy(dataValues, 'orgUnit');

      const orgKeys = Object.keys(orgs);
      // orgKeys.forEach(orgKey => {
      let donne = 0;
      dataValues.forEach((source) => {
        // const orgPeriod = _.groupBy(orgs[orgKey], 'period');
        // const orgPeriodKeys = Object.keys(orgPeriod);

        if (source.value >= 80) {
          const score = 1;

          donne += 1;

          result.dataValues.push({
						    orgUnit: source.orgUnit,
            period: source.period,
            value: score,
            dataElement: score80,
            storedBy: `IMA ${source.created}`,
            created: source.created,
          });
        }
      });

      console.log(`nombre : ${donne}`);
      fs.writeFileSync('./score_80.json', JSON.stringify(result));

      return api.postData({
        data: result,
        url: 'https://ima-assp.org/api/dataValueSets?skipAudit=true',
      });
    })
    .then(() => {
      mailer.sendMail('success!!! Import Score 80', 'Import Score 80');
    }).catch((err) => {
      mailer.sendMail(`Fail!!! Import Score 80${JSON.stringify(err)}`, 'Fail!!! Import Score 80');
    });
};
