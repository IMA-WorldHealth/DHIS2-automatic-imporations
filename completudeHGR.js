const API = require('./lib/dhis2-api');
const mailer = require('./mailer');

module.exports.postData = (auth) => {

  const api = new API({
    credentials: auth,
    url: `https://ima-assp.org/api/analytics/dataValueSet.json`
  });

  const query = `dimension=pe:THIS_QUARTER;LAST_QUARTER&dimension=dx:pJxcWVobpl2.ACTUAL_REPORTS&dimension=nfFNhVrBFwh:r0kbOtny4Fr&dimension=ou:OU_GROUP-MCkcTOULWEW;I8CuQpdBQfP;D15NtionqkH;uyuwe6bqphf;iu4Zj3Zq39m;mnOXJ2Oa5U7&displayProperty=NAME`;
  // download the Data                                                                                                                                                                                       
  api.analytics({ query })
    .then(source => {

      const dataValues = source.dataValues;

      const result = {
        dataValues: []
      };
      const completude = "fQAidw8S5ud";

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
    
      return api.postData({
        data: result,
        url: 'https://ima-assp.org/api/dataValueSets'
      });
    })
    .then(() => {
      mailer.sendMail('completudeHGR', 'DHIS2 automatic importations for completudeHGR');
    }).catch(err => {
      mailer.sendMail('completudeHGR Importation fails', 'Importation fails for completudeHGR ' + JSON.stringify(err));
    });

}