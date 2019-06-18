const API = require('./lib/dhis2-api');
const mailer = require('./mailer');

module.exports.postData = (auth) => {

    const api = new API({
        credentials: auth,
        url: `https://ima-assp.org/api/analytics/dataValueSet.json`
    });

    const query = `dimension=dx:zdGNLhp4xAB.ACTUAL_REPORTS&dimension=ou:LEVEL-3;s7ZjqzKnWsJ&dimension=pe:THIS_QUARTER;LAST_QUARTER&displayProperty=NAME`;
    // download the Data                                                                                                                                                                                       
    api.analytics({ query })
        .then(source => {
            const dataValues = source.dataValues;

            const result = {
                dataValues: []
            };
            const completude = "ZiDq193PgqD";

            datasetMap = {};

            //console.log(source);


            dataValues.forEach(source => {
                // console.log('source element : ', source);
                let data = Math.round(source.value / 3);
                result.dataValues.push({
                    "dataElement": completude,
                    "period": source.period,
                    "orgUnit": source.orgUnit,
                    "value": data,
                    "storedBy": "IMA " + source.created,
                    "created": source.created
                });

            });

            // console.log(result);

            return api.postData({
                data: result,
                //url: 'https://ima-assp.org/api/dataValueSets?importStrategy=CREATE'
                url: 'https://ima-assp.org/api/dataValueSets?skipAudit=true'
            });
        })
        .then((response) => {
            mailer.sendMail('success!!! Import Completness for CS' + JSON.stringify(response), 'Import Completness for CS');
        }).catch(err => {
            mailer.sendMail('Fail!!! Import Completness for CS', 'Fail!!! Import Completness for CS' + JSON.stringify(err));
        });

}