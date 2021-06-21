const fs = require('fs');
const API = require('./lib/dhis2-api');
const mailer = require('./mailer');

module.exports.postData = (auth) => {
  const api = new API({
    credentials: auth,
    url: 'https://ima-assp.org/api/analytics/dataValueSet.json',
  });

  const query = 'dimension=dx:t2O2Sf4Kngw;V7bWComPcDJ;P9o3bL76s2r;PFCz0A2SBtd;w8zw7gMZQvu&dimension=pe:LAST_3_MONTHS&dimension=ou:OU_GROUP-yE7cy94lS87;OU_GROUP-r0kbOtny4Fr;s7ZjqzKnWsJ&displayProperty=NAME';
  // download the Data
  api.analytics({
    query,
  })
    .then((source) => {
      const { dataValues } = source;
      // const dataValues = request1.dataValues;

      const dataElementval = ['t2O2Sf4Kngw', 'V7bWComPcDJ', 'P9o3bL76s2r', 'PFCz0A2SBtd', 'w8zw7gMZQvu'];
      const dataElementExh = ['zNLo4MDcnyI', 'pAWUuUgO5H0', 'HRQ10ivsurn', 'XNVeTlQHhBO', 'cVmp8NMP04Z'];

      // mapping
      const mapping = {};
      dataElementval.forEach((item, index) => {
        mapping[item] = dataElementExh[index];
      });

      const result = {
        dataValues: [],
      };

      // console.log(mapping);
      // eslint-disable-next-line no-shadow
      dataValues.forEach((source) => {
        result.dataValues.push({
          dataElement: mapping[`${source.dataElement}`],
          period: source.period,
          orgUnit: source.orgUnit,
          value: 1,
          storedBy: `IMA ${source.created}`,
          created: source.created,
        });
      });

      fs.writeFileSync('./exhaustivitemed.json', JSON.stringify(result));

      return api.postData({
        data: result,
        url: 'https://ima-assp.org/api/dataValueSets?skipAudit=true',
        // url: 'https://dev.ima-assp.org/api/dataValueSets?skipAudit=true'
      });
    })
    .then((response) => {
      mailer.sendMail(JSON.stringify(response), 'Import Exhaustivity Med');
    }).catch((err) => {
      mailer.sendMail('Fail!!! Import Exhaustivity Med', `Fail!!! Import Exhaustivity Med${JSON.stringify(err)}`);
    });
};
