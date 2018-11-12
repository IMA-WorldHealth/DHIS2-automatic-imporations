const mailer = require('./mailer');
const API = require('./lib/dhis2-api');

module.exports.postData = (auth) => {

  const api = new API({
    credentials: auth,
    url: `https://ima-assp.org/api/29/analytics/dataValueSet.json`
  });

  const query = `dimension=pe:LAST_3_MONTHS&dimension=ou:LEVEL-5;s7ZjqzKnWsJ&filter=LyVu0GDia40:N68nOMNKQNK&dimension=dx:iNDXhUBhi7G;BYqAhRZhTtQ;SC9BF8zIbL7;G0pSyUFT7on&displayProperty=NAME&aggregationType=MIN`;
  // download the Data                                                                                                                                                                                       
  api.analytics({
      query
    })
    .then(source => {

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

      return api.postData({
        data: result,
        url: 'https://ima-assp.org/api/dataValueSets'
      });
    })
    .then(() => {
      mailer.sendMail('amox', 'DHIS2 automatic importations for amox');
    }).catch(err => {
      mailer.sendMail('amox Importation fails', 'Importation fails for amox' + JSON.stringify(err));
    });

}