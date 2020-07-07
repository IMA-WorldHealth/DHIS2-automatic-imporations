const mailer = require('./mailer');
const API = require('./lib/dhis2-api');
const Sqlite = require('./lib/sqlite');

async function postData(auth) {
  const api = new API({
    credentials: auth,
    url: 'https://ima-assp.org/api/analytics/dataValueSet.json',
  });

  const PERIOD = 'LAST_3_MONTHS';
  // const PERIOD = '201912';
  const query = `dimension=dx:tnhoicouMhU;s5I1AID0L1Y;WxDdamQ6ufm;Cic7ENwcUAR;C2ptkd6Klw3&dimension=pe:${PERIOD}&dimension=ou:OU_GROUP-yE7cy94lS87;OU_GROUP-r0kbOtny4Fr;s7ZjqzKnWsJ&displayProperty=NAME`;
  // download the Data
  const source = await api.analytics({ query });
  const { dataValues } = source;

  const db = new Sqlite();
  await db.connect();
  await db.exec('DROP TABLE IF EXISTS  exaustivity_med');
  await db.exec(`
    CREATE TABLE exaustivity_med (
      data_element VARCHAR(50),
      period VARCHAR(100),
      org_unit VARCHAR(20),
      value DECIMAL(19, 4),
      created DATE
    );`);

  let insertSQL = `
    INSERT INTO exaustivity_med(data_element, period, org_unit, value, created)
    VALUES  `;

  const dataElementFosa = 'lrqdpRCG5vn';

  dataValues.forEach((row, index) => {
    insertSQL += `("${dataElementFosa}", "${row.period}", "${row.orgUnit}", ${row.value}, "${row.created}")`;
    insertSQL += (index === dataValues.length - 1) ? ';' : ',';
  });

  await db.exec(insertSQL);

  const resultPost = await db.select(`
        SELECT 
          data_element as dataElement, COUNT(period)as value,
          period, org_unit as orgUnit, 
          'IMA ' || created as storedBy,created
        FROM exaustivity_med
        GROUP BY period, org_unit
        `, {});

  // free up space in the disk
  await db.exec('DELETE FROM exaustivity_med WHERE 1');

  api.postData({
    data: resultPost,
    url: 'https://ima-assp.org/api/dataValueSets?skipAudit=true',
    // url: 'https://dev.ima-assp.org/api/dataValueSets?skipAudit=true',
  }).then(() => {
    mailer.sendMail('success!!! Import Exhaustivity by Med', 'Import Exhaustivity by Med');
  }).catch((err) => {
    mailer.sendMail(`Fail!!! Import Exhaustivity by Med ${JSON.stringify(err)}`, 'Fail!!! Import Exhaustivity by Med');
  });
}

module.exports.postData = postData;
