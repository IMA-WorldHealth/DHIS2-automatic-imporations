const schedule = require('node-schedule');

// calling file exten

const completude_fosa = require('./completude_fosa');
const credential = require('./credentials/credentials.json');

const auth = credential.DHIS2;
completude_fosa.postData(auth);