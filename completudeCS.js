const fs = require('fs');
const request = require('request-promise-native');
const mailer = require('./mailer');

module.exports.postData = (auth) => {

  (async () => {
    try {

      // download the Data                                                                                                                                                                                       
      let source = await request.get(`https://ima-assp.org/api/analytics/dataValueSet.json?dimension=pe:THIS_QUARTER;LAST_QUARTER&dimension=dx:zdGNLhp4xAB.ACTUAL_REPORTS&dimension=nfFNhVrBFwh:yE7cy94lS87&dimension=ou:OU_GROUP-MCkcTOULWEW;I8CuQpdBQfP;D15NtionqkH;uyuwe6bqphf;iu4Zj3Zq39m;mnOXJ2Oa5U7&displayProperty=NAME`, {
        auth
      });


      source = JSON.parse(source);

      const dataValues = source.dataValues;

      const result = {
        dataValues: []
      };
      const completude = "ZiDq193PgqD";

      datasetMap = {};

      //console.log(source);


      dataValues.forEach(source => {
        // console.log('source element : ', source);
        let data = Math.round(source.value / 3);
        result.dataValues.push({
          "dataElement": completude,
          "period": source.period,
          "orgUnit": source.orgUnit,
          "value": data,
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
          mailer.sendMail('completudeCS', 'DHIS2 automatic importations for completudeCS');
        }
        console.log(body);
        console.log(error);
      });

    } catch (e) {
      console.error('An error occured:', e);
    }
  })();
}