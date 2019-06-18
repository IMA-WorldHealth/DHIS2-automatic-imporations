const schedule = require('node-schedule');

// calling file exten
const amoxycilline_min = require('./amoxycilline_min');
const completude_fosa = require('./completude_fosa');
const completude_pcima = require('./completude_pcima');
const completude_cs = require('./completude_cs');
const completude_hgr = require('./completude_hgr');
const completude_survepi = require('./completude_survepi');
const exhaustivite_nut = require('./exhaustivite_nut');
const codesa = require('./codesa');
const credential = require('./credentials/credentials.json');


// Schedule execution
const rule = new schedule.RecurrenceRule();
// rule.dayOfWeek = [0, new schedule.Range(4, 6)];
rule.hour = 0;
rule.minute = 0;

console.log('Starting Script');
// Using function
schedule.scheduleJob(rule, () => {
  console.log('Scheduling jobs');
  ExecuteAndCatchErrors();
});

function ExecuteAndCatchErrors() {
  try {
    const auth = credential.DHIS2;
    completude_fosa.postData(auth);
    completude_pcima.postData(auth);
    completude_cs.postData(auth);
    completude_hgr.postData(auth);
    completude_survepi.postData(auth);
    amoxycilline_min.postData(auth);
    codesa.postData(auth);
    exhaustivite_nut.postData(auth);
  } catch (error) {
    console.log('global error occurred');
    console.log(error);
  }
}
