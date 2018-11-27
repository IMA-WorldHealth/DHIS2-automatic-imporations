const API = require('./lib/dhis2-api');
const mailer = require('./mailer');

module.exports.postData = (auth) => {

  const api = new API({
    credentials: auth,
    url: `https://ima-assp.org/api/29/analytics/dataValueSet.json`
  });

  const query = `dimension=pe:LAST_52_WEEKS&dimension=ou:LEVEL-5;s7ZjqzKnWsJ&filter=nfFNhVrBFwh:yE7cy94lS87;r0kbOtny4Fr&dimension=dx:cEApqsZvmn5;cQbiOs2lTAL;FPN2IJCJ8gc;ua4PkR72PSp;ZkRS89FoBz3;y0BquzOLBHE;zFxILdvAS7m;GuhkFtaibix;ER5XwifODpR;jezOUtM6pRE;pc68Q1jSe1x;oAxYp8kZFHF;SqZrut7CiR8;MGbfl6DBR2o;CMiXfqulkeH;GhLnpzFZ7L3;QBaNx8Sy1QW;fRUIniV6k8A;KlNYT9xHzAP;ubNSIA9OF7D;oYNAocdPMlA;m7OcflQ1KuZ;RcPAsdpKMTN;CFDDPL9jFnP;A6oPe1Z4Szc;NGbQlnREUv0;mAoysriVUJT;NhUW2L9h20t;gozQZsfJ7R5;oG2DIcNLFMc;LO4ph2D3l2a;HPMgIC2SO5g;yOnluN2UvTV;iqqmzdrtylI;wF968tBudKo;G9KomsNxrje;D3MP5WBYKdd;w5fVmpsLe8Y&displayProperty=NAME`;

  api.analytics({
      query
    })
    .then(source => {

      const dataValues = source.dataValues;
      const dataMap = {};
      var periods = [];

      //donnees apres elimination de doublons par period et unite d'orgabisation
      var lastData = [];

      // regroupons les donnees par period
      dataValues.forEach(ligne => {
        if (!dataMap[ligne.period]) {
          dataMap[ligne.period] = [];
          periods.push(ligne.period);
        }
        dataMap[ligne.period].push(ligne);
      });


      // detectons les elements à ecarter apres regroupement par period
      periods.forEach(period => {
        var orgUnits = {};
        var datasPeriod = dataMap[period]; // les donnees pour une periode

        datasPeriod.forEach(dataPeriod => {

          if (orgUnits[dataPeriod.orgUnit]) {
            dataPeriod.Aecarter = true; // trouvE
          } else {
            orgUnits[dataPeriod.orgUnit] = true;
          }

        });

        lastData.push(datasPeriod.filter(row => {
          return !row.Aecarter;
        }));

      });

      var lastDatatemp = [];
      lastData.forEach(row => {
        row.forEach(ligne => {
          lastDatatemp.push(ligne);
        });
      });

      lastData = lastDatatemp;

      const result = {
        completeDataSetRegistrations: []
      };

      lastData.forEach(ligne => {

        result.completeDataSetRegistrations.push({
          "period": ligne.period,
          "dataSet": "gzQSYZIDZYF",
          "organisationUnit": ligne.orgUnit,
          "attributeOptionCombo": "c6PwdArn3fZ",
          "date": ligne.created,
          "storedBy": "IMA " + ligne.created
        });
      });

      return api.postData({
        data: result,
        url: 'https://ima-assp.org/api/completeDataSetRegistrations'
      });
    })
    .then(() => {
      mailer.sendMail('Survepi', 'DHIS2 automatic importations for Survepi');
    }).catch(err => {
      mailer.sendMail('Survepi Importation fails', 'Importation fails for Survepi ' + JSON.stringify(err));
    });

}