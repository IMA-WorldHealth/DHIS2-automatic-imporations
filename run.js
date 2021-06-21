const schedule = require('node-schedule');

// calling file exten

const exhaustivite_CS_HGR = require('./exhaustivite_CS_HGR');
const exhaustivite_all = require('./exhaustivite_all');
//const score_80 = require('./score_80');
//const completude_fosa = require('./completude_fosa');
const credential = require('./credentials/credentials.json');

const auth = credential.DHIS2;
//score_80.postData(auth);
exhaustivite_CS_HGR.postData(auth);
exhaustivite_all.postData(auth);