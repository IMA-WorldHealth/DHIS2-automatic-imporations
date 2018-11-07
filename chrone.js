var schedule = require('node-schedule');

//calling file exten
const amox = require('./amox');
const exhausnis = require('./exhausnis');
const prod = require('./prod');
const pcima = require('./pcima');
const completudeCS = require('./completudeCS');
const completudeHGR = require('./completudeHGR');
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
    exhausnis.postData(auth);
    prod.postData(auth);
    pcima.postData(auth);
    completudeCS.postData(auth);
    completudeHGR.postData(auth);
    amox.postData(auth);

  } catch (error) {
    console.log('global error');
    console.log(error);
  }
}