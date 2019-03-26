const API = require('./lib/dhis2-api');
const mailer = require('./mailer');

module.exports.postData = (auth) => {

    const api = new API({
        credentials: auth,
        url: `https://ima-assp.org/api/analytics/dataValueSet.json`
    });

    const query = `dimension=dx:CmgZSXVpyWR&dimension=pe:LAST_3_MONTHS&dimension=ou:LEVEL-4;s7ZjqzKnWsJ&displayProperty=NAME`;
    // download the Data                                                                                                                                                                                       
    api.analytics({
            query
        })
        .then(source => {
            const dataValues = source.dataValues;
            //const dataValues = request1.dataValues;

            const dataElementFOSA = ['CmgZSXVpyWR']
            const dataElementAS = ['rVr8pi2mP6S'];
            datasetMap = {};

            // mapping
            const mapping = {};
            dataElementFOSA.map((item, index) => {
                mapping[item] = dataElementAS[index];
            });

            const result = {
                dataValues: []
            };


            dataValues.forEach(source => {
                result.dataValues.push({
                    "dataElement": "rVr8pi2mP6S",
                    "period": source.period,
                    "orgUnit": source.orgUnit,
                    "value": 1,
                    "storedBy": "IMA " + source.created,
                    "created": source.created
                });

            });
            //console.log(result);

            return api.postData({
                data: result,
                url: 'https://ima-assp.org/api/dataValueSets?skipAudit=true'
                    //url: 'https://dev.ima-assp.org/api/dataValueSets'
            });
        })
        .then(() => {
            mailer.sendMail('success!!! Import CODESA Fonctionnel AS', 'Import CODESA Fonctionnel AS');
        }).catch(err => {
            mailer.sendMail('Fail!!! Import CODESA Fonctionnel AS' + JSON.stringify(err), 'Fail!!! Import CODESA Fonctionnel AS');
        });

}