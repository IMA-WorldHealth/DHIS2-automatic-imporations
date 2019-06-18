const API = require('./lib/dhis2-api');
const mailer = require('./mailer');
// var fs = require('fs');

module.exports.postData = (auth) => {
  const api = new API({
    credentials: auth,
    url: 'https://ima-assp.org/api/analytics/dataValueSet.json',
  });

  const PERIOD = 'LAST_3_MONTHS';

  // const query = `dimension=dx:UzeZsiFCN83;oFJTuxCeUyY;yU3EslDcTLU;jWYUdz1a2UJ;oK1N4zMp5WQ&dimension=pe:LAST_3_MONTHS&dimension=ou:LEVEL-5;s7ZjqzKnWsJ&displayProperty=NAME`;
  const query = `dimension=dx:WgZr7FrDfVn;DQiMxAlXTOe;kGmdIbd3mbn;zcH4sipFcUr;cTLKwfG8pSv;xmbsTpMq7wx;V7bWComPcDJ;P9o3bL76s2r;eCYnE89bKmD;PFCz0A2SBtd;w8zw7gMZQvu;TkAGe7FvxzX&dimension=pe:${PERIOD}&dimension=ou:OU_GROUP-yE7cy94lS87;OU_GROUP-r0kbOtny4Fr;s7ZjqzKnWsJ&displayProperty=NAME`;

  // download the Data
  api.analytics({ query })
    .then((source) => {
      const { dataValues } = source;
      // const dataValues = request1.dataValues;

      // const dataElementval = ['oK1N4zMp5WQ', 'jWYUdz1a2UJ', 'yU3EslDcTLU', 'oFJTuxCeUyY', 'UzeZsiFCN83']
      // const dataElementExh = ['XNVeTlQHhBO', 'cVmp8NMP04Z', 'HRQ10ivsurn', 'pAWUuUgO5H0', 'zNLo4MDcnyI'];

      const dataElementval = ['eCYnE89bKmD', 'w8zw7gMZQvu', 'DQiMxAlXTOe', 'zcH4sipFcUr', 'xmbsTpMq7wx', 'kGmdIbd3mbn', 'WgZr7FrDfVn', 'P9o3bL76s2r', 'cTLKwfG8pSv', 'V7bWComPcDJ', 'PFCz0A2SBtd', 'TkAGe7FvxzX'];
      const dataElementExh = ['pvdqiBr3axm', 'cVmp8NMP04Z', 'NFzQu6qEDwp', 'wMkTSZudDyO', 'zNLo4MDcnyI', 'eI7s8XvUore', 'vvzOIsNR5SE', 'HRQ10ivsurn', 'afE4UcxztvZ', 'pAWUuUgO5H0', 'XNVeTlQHhBO', 'twTFi7fp8wD'];


      datasetMap = {};

      // mapping
      const mapping = {};
      dataElementval.map((item, index) => {
        mapping[item] = dataElementExh[index];
      });

      const result = {
        dataValues: [],
      };


      // console.log('mapping : ', mapping);
      dataValues.forEach((source) => {
        // console.log('source element : ', source);
        result.dataValues.push({
          dataElement: mapping[source.dataElement],
          period: source.period,
          orgUnit: source.orgUnit,
          value: 1,
          storedBy: `IMA ${source.created}`,
          created: source.created,
        });
      });
      // console.log(result);

      // fs.writeFileSync('1data.json', JSON.stringify(result))
      /*
                        fs.writeFile('mynewfile3.txt', result, function(err) {
                            if (err) throw err;
                            console.log('Saved!');
                        });
            */

      return api.postData({
        data: result,
        // url: 'https://ima-assp.org/api/dataValueSets?importStrategy=CREATE'
        url: 'https://ima-assp.org/api/dataValueSets?skipAudit=true',
        // url: 'https://dev.ima-assp.org/api/dataValueSets?skipAudit=true',
      });
    })

    .then(() => {
      mailer.sendMail('success!!! Import Exhaustivity by FOSA', 'Import Exhaustivity by FOSA');
    }).catch((err) => {
      mailer.sendMail(`Fail!!! Import Exhaustivity by FOSA${JSON.stringify(err)}`, 'Fail!!! Import Exhaustivity by FOSA');
    });
};
