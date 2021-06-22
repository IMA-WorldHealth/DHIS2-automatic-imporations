// calling file exten
const exhaustivite_nut = require('./exhaustivite_nut');

const credential = require('./credentials/credentials.json');

const auth = credential.DHIS2;
exhaustivite_nut.postData(auth);
