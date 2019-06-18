var schedule = require('node-schedule');

//calling file exten
const amoxycilline_min = require('./amoxycilline_min');
const exhaustivite_snis = require('./exhaustivite_snis');
const completude_fosa = require('./completude_fosa');
const completude_pcima = require('./completude_pcima');
const completude_cs = require('./completude_cs');
const completude_hgr = require('./completude_hgr');
const completude_survepi = require('./completude_survepi');
const exhaustivite_med = require('./exhaustivite_med');
const exhaustivite_nut = require('./exhaustivite_nut');
const codesa = require('./codesa');
const credential = require('./credentials.json');




const auth = credential.DHIS2;

completude_fosa.postData(auth);