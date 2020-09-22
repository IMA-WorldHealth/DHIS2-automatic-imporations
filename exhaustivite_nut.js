const fs = require('fs');
const mailer = require('./mailer');
const API = require('./lib/dhis2-api');
const Sqlite = require('./lib/sqlite');

async function postData(auth) {
  const api = new API({
    credentials: auth,
    url: 'https://ima-assp.org/api/analytics/dataValueSet.json',
  });

  const PERIOD = 'LAST_3_MONTHS';
  //const PERIOD = '202001;202002;202003';
  //const query = `dimension=dx:kSfzX7CI9Pa.c6PwdArn3fZ;fxp6usJqASn.c6PwdArn3fZ;loz95d1Bj2X.c6PwdArn3fZ;ry4CAnw2PBH.nrcLHEDh2Rg;ry4CAnw2PBH.EsE3Jr84doi;APuTx7KceW4.nrcLHEDh2Rg;APuTx7KceW4.EsE3Jr84doi&dimension=pe:${PERIOD}&dimension=ou:LEVEL-4;s7ZjqzKnWsJ&displayProperty=NAME`;
  const query = `dimension=dx:rxmxiaUadTA.bHW4SLyYQzK;wsCeuBQB7Zu.erc0DPwRTGs;rxmxiaUadTA.cFIDOqFqZYq;wsCeuBQB7Zu.bE54ow98bbh;rxmxiaUadTA.EX0kPmRBvTC;wsCeuBQB7Zu.pu4ZHu96A6j;rxmxiaUadTA.SXHhFJXfNik;wsCeuBQB7Zu.kNpThwmu07n&dimension=pe:${PERIOD}&dimension=ou:LEVEL-4;s7ZjqzKnWsJ&displayProperty=NAME`;
 
  // download the Data
  const source = await api.analytics({ query });
  const { dataValues } = source;

  const db = new Sqlite();
  await db.connect();
  await db.exec('DROP TABLE IF EXISTS  exaustivity_nut');
  await db.exec(`
    CREATE TABLE exaustivity_nut (
      data_element VARCHAR(50),
      period VARCHAR(100),
      org_unit VARCHAR(20),
      value DECIMAL(19, 4),
      created DATE
    );`);
  let insertSQL = `
    INSERT INTO exaustivity_nut(data_element, period, org_unit, value, created)
    VALUES  `;
  
    //Dataelement exhaustivite Nut

  const dataElementNut = 'Ga5e2gQ51B8';


  dataValues.forEach((row, index) => {
    insertSQL += `("${dataElementNut}", "${row.period}", "${row.orgUnit}", ${row.value}, "${row.created}")`;
    insertSQL += (index === dataValues.length - 1) ? ';' : ',';
  });

  await db.exec(insertSQL);

  const resultPost = await db.select(`
        SELECT 
          data_element as dataElement, COUNT(period)as value,
          period, org_unit as orgUnit, 
          'IMA ' || created as storedBy,created
        FROM exaustivity_nut
        GROUP BY period, org_unit
        `, {});
  fs.writeFileSync('./exhaustivitenut.json', JSON.stringify(resultPost));

  api.postData({
    data: {
      dataValues: resultPost,
    },
    url: 'https://ima-assp.org/api/dataValueSets?skipAudit=true',
    // url: 'https://dev.ima-assp.org/api/dataValueSets?skipAudit=true',
  }).then(() => {
    mailer.sendMail('success!!! Import Exhaustivity Nutrition', 'Import Exhaustivity Nutrition');
  }).catch((err) => {
    mailer.sendMail(`Fail!!! Import Exhaustivity Nutrition${JSON.stringify(err)}`, 'Fail!!! Import Exhaustivity Nutrition');
  });
}


module.exports.postData = postData;
