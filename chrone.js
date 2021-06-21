require('dotenv').config();
const schedule = require('node-schedule');
const debug = require('debug')('dhis2-automatic-importations');

// calling file exten
const amoxycilline_min = require('./amoxycilline_min');
const completude_fosa = require('./completude_fosa');
const completude_pcima = require('./completude_pcima');
const completude_cs = require('./completude_cs');
const completude_hgr = require('./completude_hgr');
const completude_survepi = require('./completude_survepi');
const exhaustivite_nut = require('./exhaustivite_nut');
const exhaustivite_CS_HGR = require('./exhaustivite_CS_HGR');
const exhaustivite_all = require('./exhaustivite_all');
const codesa = require('./codesa');
const score_80 = require('./score_80');

const auth = {
  user: process.env.DHIS2_USER,
  pass: process.env.DHIS2_PASSWORD,
};

// Schedule execution
const rule = new schedule.RecurrenceRule();
// rule.dayOfWeek = [0, new schedule.Range(4, 6)];
rule.hour = 0;
rule.minute = 0;

function ExecuteAndCatchErrors() {
  debug('Starting ExecuteAndCatchErrors()');
  try {
    completude_fosa.postData(auth);
    completude_pcima.postData(auth);
    completude_cs.postData(auth);
    completude_hgr.postData(auth);
    completude_survepi.postData(auth);
    amoxycilline_min.postData(auth);
    codesa.postData(auth);
    exhaustivite_nut.postData(auth);
    exhaustivite_CS_HGR.postData(auth);
    exhaustivite_all.postData(auth);
    score_80.postData(auth);
  } catch (error) {
    debug('A global error occurred.');
    debug(error);
  }
}

debug('Starting script');
debug(`Next run of rule at : ${rule.nextInvocationDate().toLocaleString()}`);


// Using function
schedule.scheduleJob(rule, () => {
  debug('Starting jobs...');
  ExecuteAndCatchErrors();
});
