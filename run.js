// calling file exten
require('dotenv').config();
const debug = require('debug')('dhis2-automatic-importations');
const completudeFosa = require('./exhaustivite_CS_HGR');

const auth = {
  user: process.env.DHIS2_USER,
  pass: process.env.DHIS2_PASSWORD,
};

(async () => {
  debug('Running run()');
  await completudeFosa.postData(auth);
  debug('Running done.');
})();
