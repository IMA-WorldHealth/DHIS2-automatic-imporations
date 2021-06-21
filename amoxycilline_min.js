const _ = require('lodash');
const mailer = require('./mailer');
const API = require('./lib/dhis2-api');

module.exports.postData = (auth) => {
  const result = { dataValues: [] };
  const api = new API({
    credentials: auth,
    url: 'https://ima-assp.org/api/analytics/dataValueSet.json',
  });

  const query = 'dimension=pe:LAST_3_MONTHS&dimension=ou:LEVEL-5;s7ZjqzKnWsJ&filter=LyVu0GDia40:N68nOMNKQNK&dimension=dx:iNDXhUBhi7G;BYqAhRZhTtQ;SC9BF8zIbL7;G0pSyUFT7on&displayProperty=NAME&aggregationType=MIN';
  // download the Data
  api.analytics({
    query,
  })
    .then((source) => {
      const { dataValues } = source;

      const amox = 'UzeZsiFCN83';

      const orgs = _.groupBy(dataValues, 'orgUnit');

      const orgKeys = Object.keys(orgs);
      orgKeys.forEach((orgKey) => {
        const orgPeriod = _.groupBy(orgs[orgKey], 'period');
        const orgPeriodKeys = Object.keys(orgPeriod);

        orgPeriodKeys.forEach((opKey) => {
          const elements = orgPeriod[opKey];
          let min = parseFloat(elements[0].value || 0);
          let indice = 0;
          for (let i = 1; i < elements.length; i++) {
            const value = parseFloat(elements[i].value || 0);
            if (value < min) {
              min = value;
              indice = i;
            }
          }

          result.dataValues.push({
            orgUnit: elements[indice].orgUnit || '',
            period: opKey,
            value: min,
            dataElement: amox,
            storedBy: `IMA ${elements[indice].created}`,
            created: elements[indice].created,
          });
        });
      });

      return api.postData({
        data: result,
        url: 'https://ima-assp.org/api/dataValueSets?skipAudit=true',
      });
    })
    .then(() => {
      mailer.sendMail('success!!! Import stock out min for Amoxycilline', 'Import stock out min for Amoxycilline');
    }).catch((err) => {
      mailer.sendMail('Fail!!! Import stock out min for Amoxycilline', `Fail!!! Import stock out min for Amoxycilline${JSON.stringify(err)}`);
    });
};
