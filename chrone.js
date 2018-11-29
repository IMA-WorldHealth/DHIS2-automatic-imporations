var schedule = require('node-schedule');

//calling file exten
const amoxycilline_min = require('./amoxycilline_min');
const exhaustivite_snis = require('./exhaustivite_snis');
const completude_fosa = require('./completude_fosa');
const completude_pcima = require('./completude_pcima');
const completude_cs = require('./completude_cs');
const completude_hgr = require('./completude_hgr');
const completude_survepi = require('./completude_survepi');
const credential = require('./credentials.json');

//Schedule execution
var rule = new schedule.RecurrenceRule();
// rule.dayOfWeek = [0, new schedule.Range(4, 6)];
rule.hour = 2;
rule.minute = 0;

console.log('Starting Script');

// Using function
var j = schedule.scheduleJob(rule, function () {
  console.log('Scheduling jobs');
  ExecuteAndCatchErrors();
});


function ExecuteAndCatchErrors() {
  try {
    const auth = credential.DHIS2;
    exhaustivite_snis.postData(auth);
    completude_fosa.postData(auth);
    completude_pcima.postData(auth);
    completude_cs.postData(auth);
    completude_hgr.postData(auth);
    completude_survepi.postData(auth);
    amoxycilline_min.postData(auth);
  } catch (error) {
    console.log('global error');
    console.log(error);
  }
}