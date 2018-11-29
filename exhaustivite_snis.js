const API = require('./lib/dhis2-api');
const mailer = require('./mailer');

module.exports.postData = (auth) => {

  const api = new API({
    credentials: auth,
    url: `https://ima-assp.org/api/analytics/dataValueSet.json`
  });

  const query = `dimension=dx:WgZr7FrDfVn;DQiMxAlXTOe;kGmdIbd3mbn;zcH4sipFcUr;cTLKwfG8pSv;t2O2Sf4Kngw;xmbsTpMq7wx;V7bWComPcDJ;P9o3bL76s2r;eCYnE89bKmD;PFCz0A2SBtd;w8zw7gMZQvu&dimension=pe:LAST_3_MONTHS&dimension=ou:LEVEL-4;s7ZjqzKnWsJ&displayProperty=NAME`;
  // download the Data                                                                                                                                                                                       
  api.analytics({ query })
    .then(source => {
      const dataValues = source.dataValues;
      //const dataValues = request1.dataValues;

      const dataElementval = ['eCYnE89bKmD', 'w8zw7gMZQvu', 'DQiMxAlXTOe', 'zcH4sipFcUr', 'xmbsTpMq7wx', 'kGmdIbd3mbn', 'WgZr7FrDfVn', 'P9o3bL76s2r', 'cTLKwfG8pSv', 'V7bWComPcDJ', 't2O2Sf4Kngw', 'PFCz0A2SBtd']
      const dataElementExh = ['gFpXTSpFCRh', 'Yo3YKPRRssm', 'ais8PY2VpJS', 'YUKSnrDv9TF', 'Q58HXR7LU3H', 'RBzrs2EJpBK', 'rqccef7ALqi', 'NOmGBXgcsR5', 'slRIl13NTEp', 'G5HjSON1Y3Y', 'mu5ADwz3Inm', 'iO7HREhicgi'];
      datasetMap = {};

      // mapping
      const mapping = {};
      dataElementval.map((item, index) => {
        mapping[item] = dataElementExh[index];
      });

      const result = {
        dataValues: []
      };


      // console.log('mapping : ', mapping);
      dataValues.forEach(source => {
        // console.log('source element : ', source);
        result.dataValues.push({
          "dataElement": mapping[source.dataElement],
          "period": source.period,
          "orgUnit": source.orgUnit,
          "value": 1,
          "storedBy": "IMA " + source.created,
          "created": source.created
        });

      });
      //console.log(result);

      return api.postData({
        data: result,
        url: 'https://ima-assp.org/api/dataValueSets'
      });
    })
    .then(() => {
      mailer.sendMail('success!!! Import Exhaustivity SNIS Data', 'Import Exhaustivity SNIS Data');
    }).catch(err => {
      mailer.sendMail('Fail!!! Import Exhaustivity SNIS Data', 'Fail!!! Import Exhaustivity SNIS Data' + JSON.stringify(err));
    });

}