// calling file exten
const completudeFosa = require('./exhaustivite_fosa');

const credential = require('./credentials/credentials.json');

const auth = credential.DHIS2;
completudeFosa.postData(auth);
