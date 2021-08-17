// calling file exten
require('dotenv').config();
const debug = require('debug')('dhis2-automatic-importations');
const exhaustivite_CS_HGR = require('./exhaustivite_CS_HGR');
const exhaustivite_all = require('./exhaustivite_all');

const auth = {
  user: process.env.DHIS2_USER,
  pass: process.env.DHIS2_PASSWORD,
};

(async () => {
  debug('Running run()');
  await exhaustivite_CS_HGR.postData(auth);
  await exhaustivite_all.postData(auth);
  debug('Running done.');
})();
