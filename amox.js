const fs = require('fs');
const request = require('request-promise-native');
const mailer = require('./mailer');

module.exports.postData = (auth) => {
  // authentication                                                                                                                                                                                                 

  (async () => {
    try {
      // download the Data                                                                                                                                                                                       
      let source = await request.get(`
        https://ima-assp.org/api/29/analytics/dataValueSet.json?dimension=pe:LAST_3_MONTHS&dimension=ou:LEVEL-5;s7ZjqzKnWsJ&filter=LyVu0GDia40:N68nOMNKQNK&dimension=dx:iNDXhUBhi7G;BYqAhRZhTtQ;SC9BF8zIbL7;G0pSyUFT7on&displayProperty=NAME&aggregationType=MIN`, {
        auth
      });

      source = JSON.parse(source);

      const dataValues = source.dataValues;

      const result = {
        dataValues: []
      };
      const amox = "UzeZsiFCN83";

      datasetMap = {};

      //console.log(source);
      dataValues.forEach(source => {
        // console.log('source element : ', source);
        result.dataValues.push({
          "dataElement": amox,
          "period": source.period,
          "orgUnit": source.orgUnit,
          "value": source.value,
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
          mailer.sendMail('amox', 'DHIS2 automatic importations for amox');
        }
        console.log(body);
        console.log(error);
      });

    } catch (e) {
      console.error('An error occured:', e);
    }
  })();
}