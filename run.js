// calling file exten
const exhaustivite_all = require('./exhaustivite_all');
const exhaustivite_CS_HGR = require('./exhaustivite_CS_HGR');

const auth = {
  user: process.env.DHIS2_USER,
  pass: process.env.DHIS2_PASSWORD,
};

const auth = credential.DHIS2;
exhaustivite_all.postData(auth);
exhaustivite_CS_HGR.postData(auth);
