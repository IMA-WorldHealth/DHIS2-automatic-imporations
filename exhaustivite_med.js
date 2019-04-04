const API = require('./lib/dhis2-api');
const mailer = require('./mailer');

module.exports.postData = (auth) => {

    const api = new API({
        credentials: auth,
        url: `https://ima-assp.org/api/analytics/dataValueSet.json`
    });

    const query = `dimension=dx:UzeZsiFCN83;oFJTuxCeUyY;yU3EslDcTLU;jWYUdz1a2UJ;oK1N4zMp5WQ&dimension=pe:LAST_3_MONTHS&dimension=ou:LEVEL-5;s7ZjqzKnWsJ&displayProperty=NAME`;
    // download the Data                                                                                                                                                                                       
    api.analytics({ query })
        .then(source => {
            const dataValues = source.dataValues;
            //const dataValues = request1.dataValues;

            const dataElementval = ['oK1N4zMp5WQ', 'jWYUdz1a2UJ', 'yU3EslDcTLU', 'oFJTuxCeUyY', 'UzeZsiFCN83']
            const dataElementExh = ['XNVeTlQHhBO', 'cVmp8NMP04Z', 'HRQ10ivsurn', 'pAWUuUgO5H0', 'zNLo4MDcnyI'];
            datasetMap = {};

            // mapping
            const mapping = {};
            dataElementval.map((item, index) => {
                mapping[item] = dataElementExh[index];
            });

            const result = {
                dataValues: []
            };


            // console.log('mapping : ', mapping);
            dataValues.forEach(source => {
                // console.log('source element : ', source);
                result.dataValues.push({
                    "dataElement": mapping[source.dataElement],
                    "period": source.period,
                    "orgUnit": source.orgUnit,
                    "value": 1,
                    "storedBy": "IMA " + source.created,
                    "created": source.created
                });

            });
            console.log(result);

            return api.postData({
                data: result,
                //url: 'https://ima-assp.org/api/dataValueSets?importStrategy=CREATE'
                url: 'https://ima-assp.org/api/dataValueSets?skipAudit=true'
            });
        })
        .then(() => {
            mailer.sendMail('success!!! Import Exhaustivity MEG Data', 'Import Exhaustivity MEG Data');
        }).catch(err => {
            mailer.sendMail('Fail!!! Import Exhaustivity MEG Data', 'Fail!!! Import Exhaustivity MEG Data' + JSON.stringify(err));
        });

}