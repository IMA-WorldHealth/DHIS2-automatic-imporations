const mailer = require('./mailer');
const API = require('./lib/dhis2-api');
const Sqlite = require('./lib/sqlite');
// const fs = require('fs');

async function postData(auth) {
  const api = new API({
    credentials: auth,
    url: 'https://ima-assp.org/api/analytics/dataValueSet.json',
  });

  const PERIOD = 'LAST_3_MONTHS';
  const query = `dimension=dx:WgZr7FrDfVn;DQiMxAlXTOe;kGmdIbd3mbn;zcH4sipFcUr;cTLKwfG8pSv;eCYnE89bKmD;TkAGe7FvxzX&dimension=pe:${PERIOD}&dimension=ou:OU_GROUP-yE7cy94lS87;OU_GROUP-r0kbOtny4Fr;s7ZjqzKnWsJ&displayProperty=NAME`;

  // download the Data
  const source = await api.analytics({ query });
  const { dataValues } = source;

  const db = new Sqlite();
  await db.connect();
  await db.exec('DROP TABLE IF EXISTS  exaustivity_fosa');
  await db.exec(`
    CREATE TABLE exaustivity_fosa (
      data_element VARCHAR(50),
      period VARCHAR(100),
      org_unit VARCHAR(20),
      value DECIMAL(19, 4),
      created DATE
    );`);
  let insertSQL = `
    INSERT INTO exaustivity_fosa(data_element, period, org_unit, value, created)
    VALUES  `;

  // Dataelement exhaustivite fosa

  const dataElementFosa = 'HpTkis3ZI00';

  dataValues.forEach((row, index) => {
    insertSQL += `("${dataElementFosa}", "${row.period}", "${row.orgUnit}", ${row.value}, "${row.created}")`;
    insertSQL += (index === dataValues.length - 1) ? ';' : ',';
  });

  await db.exec(insertSQL);

  const resultPost = await db.select(`
        SELECT 
          data_element as dataElement,
          COUNT(period)as value,
          period, org_unit as orgUnit, 
          'IMA ' || created as storedBy,created
        FROM exaustivity_fosa
        GROUP BY period, org_unit
        `, {});
  /*
  fs.writeFileSync('file.json', JSON.stringify({
    dataValues: resultPost,
  }));
*/
  api.postData({
    data: {
      dataValues: resultPost,
    },
    url: 'https://ima-assp.org/api/dataValueSets?skipAudit=true',
    // url: 'https://dev.ima-assp.org/api/dataValueSets?skipAudit=true',
  }).then(() => {
    mailer.sendMail('success!!! Import Exhaustivity by FOSA', 'Import Exhaustivity by FOSA');
  }).catch((err) => {
    mailer.sendMail(`Fail!!! Import Exhaustivity by FOSA${JSON.stringify(err)}`, 'Fail!!! Import Exhaustivity by FOSA');
  });
}

module.exports.postData = postData;
