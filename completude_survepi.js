const mailer = require('./mailer');
const API = require('./lib/dhis2-api');

module.exports.postData = (auth) => {
  const api = new API({
    credentials: auth,
    url: 'https://ima-assp.org/api/analytics/dataValueSet.json',
  });

  const query = 'dimension=pe:LAST_52_WEEKS&dimension=ou:LEVEL-5;s7ZjqzKnWsJ&dimension=dx:cEApqsZvmn5;cQbiOs2lTAL;FPN2IJCJ8gc;ua4PkR72PSp;ZkRS89FoBz3;y0BquzOLBHE;zFxILdvAS7m;GuhkFtaibix;ER5XwifODpR;jezOUtM6pRE;pc68Q1jSe1x;oAxYp8kZFHF;SqZrut7CiR8;MGbfl6DBR2o;CMiXfqulkeH;GhLnpzFZ7L3;QBaNx8Sy1QW;fRUIniV6k8A;KlNYT9xHzAP;ubNSIA9OF7D;oYNAocdPMlA;m7OcflQ1KuZ;RcPAsdpKMTN;CFDDPL9jFnP;A6oPe1Z4Szc;NGbQlnREUv0;mAoysriVUJT;NhUW2L9h20t;gozQZsfJ7R5;oG2DIcNLFMc;LO4ph2D3l2a;HPMgIC2SO5g;yOnluN2UvTV;iqqmzdrtylI;wF968tBudKo;G9KomsNxrje;D3MP5WBYKdd;w5fVmpsLe8Y&displayProperty=NAME';
  // download the Data
  api.analytics({
    query,
  })
    .then((source) => {
      const { dataValues } = source;

      const dataMap = {};
      const periods = [];

      // donnees apres elimination de doublons par period et unite d'orgabisation
      let lastData = [];

      // regroupons les donnees par period
      dataValues.forEach((ligne) => {
        if (!dataMap[ligne.period]) {
          dataMap[ligne.period] = [];
          periods.push(ligne.period);
        }
        dataMap[ligne.period].push(ligne);
      });

      // detectons les elements à ecarter apres regroupement par period
      periods.forEach((period) => {
        const orgUnits = {};
        const datasPeriod = dataMap[period]; // les donnees pour une periode

        datasPeriod.forEach((dataPeriod) => {
          if (orgUnits[dataPeriod.orgUnit]) {
            dataPeriod.Aecarter = true; // trouvE
          } else {
            orgUnits[dataPeriod.orgUnit] = true;
          }
        });

        lastData.push(datasPeriod.filter((row) => !row.Aecarter));
      });

      const lastDatatemp = [];
      lastData.forEach((row) => {
        row.forEach((ligne) => {
          //---------------------------------------------------------
          // Elimination de ligne avec Zéro
          if (ligne.value > 0) {
            lastDatatemp.push(ligne);
          }
          //----------------------------------------------------------
          // lastDatatemp.push(ligne);
        });
      });

      lastData = lastDatatemp;

      const result = {
        completeDataSetRegistrations: [],
      };

      lastData.forEach((ligne) => {
        result.completeDataSetRegistrations.push({
          period: ligne.period,
          dataSet: 'gzQSYZIDZYF',
          organisationUnit: ligne.orgUnit,
          attributeOptionCombo: 'c6PwdArn3fZ',
          date: ligne.created,
          storedBy: `IMA ${ligne.created}`,
        });
      });

      return api.postData({
        data: result,
        url: 'https://ima-assp.org/api/completeDataSetRegistrations',
      });
    })
    .then(() => {
      mailer.sendMail('success!!! Import completness for SURVEPI', 'Import completness for SURVEPI');
    }).catch((err) => {
      mailer.sendMail('Fail!!! Import completness for SURVEPI', `Fail!!! Import completness for SURVEPI${JSON.stringify(err)}`);
    });
};
