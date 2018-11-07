const fs = require('fs');
const request = require('request-promise-native');
const mailer = require('./mailer');

module.exports.postData = (auth) => {

  (async () => {
    try {

      // download the Data                                                                                                                                                                                       
      let source = await request.get(`
        https://ima-assp.org/api/analytics/dataValueSet.json?dimension=dx:WgZr7FrDfVn;DQiMxAlXTOe;kGmdIbd3mbn;zcH4sipFcUr;cTLKwfG8pSv;t2O2Sf4Kngw;xmbsTpMq7wx;V7bWComPcDJ;P9o3bL76s2r;eCYnE89bKmD;PFCz0A2SBtd;w8zw7gMZQvu&dimension=pe:LAST_3_MONTHS&dimension=ou:LEVEL-4;s7ZjqzKnWsJ&displayProperty=NAME`, {
        auth
      });

      source = JSON.parse(source);

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

      request({
        //url: 'https://dev.ima-assp.org/api/dataValueSets',
        url: 'https://ima-assp.org/api/dataValueSets',
        method: 'POST',
        json: result,
        auth
      }, function (error, response, body) {
        if (!error) {
          mailer.sendMail('exhausnis', 'DHIS2 automatic importations for exhausnis');
        }
        console.log(body);
        console.log(error);

      });

    } catch (e) {
      console.error('An error occured:', e);
    }
  })();
}