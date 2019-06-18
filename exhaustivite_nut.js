const API = require('./lib/dhis2-api');
const mailer = require('./mailer');

module.exports.postData = (auth) => {

    const api = new API({
        credentials: auth,
        url: `https://ima-assp.org/api/analytics/dataValueSet.json`
    });

    const query = `dimension=dx:kSfzX7CI9Pa.c6PwdArn3fZ;fxp6usJqASn.c6PwdArn3fZ;loz95d1Bj2X.c6PwdArn3fZ;ry4CAnw2PBH.nrcLHEDh2Rg;ry4CAnw2PBH.EsE3Jr84doi;APuTx7KceW4.nrcLHEDh2Rg;APuTx7KceW4.EsE3Jr84doi&dimension=pe:LAST_3_MONTHS&dimension=ou:LEVEL-4;s7ZjqzKnWsJ&displayProperty=NAME`;
    // download the Data                                                                                                                                                                                       
    api.analytics({
            query
        })
        .then(source => {
            const dataValues = source.dataValues;
            //const dataValues = request1.dataValues;

            const dataElementval = ['kSfzX7CI9Pa.c6PwdArn3fZ', 'fxp6usJqASn.c6PwdArn3fZ', 'loz95d1Bj2X.c6PwdArn3fZ', 'APuTx7KceW4.EsE3Jr84doi', 'APuTx7KceW4.nrcLHEDh2Rg', 'ry4CAnw2PBH.nrcLHEDh2Rg', 'ry4CAnw2PBH.EsE3Jr84doi']
            const dataElementExh = ['S4Al4LKbq67', 'doelqqEfv77', 'CHebmX4wcDN', 'b5YkzZhIVyJ', 'I0Qb3NBsYig', 'h4LE0FUbvmF', 'TB4KL6qjNG0'];
            datasetMap = {};

            // mapping
            const mapping = {};
            dataElementval.map((item, index) => {
                mapping[item] = dataElementExh[index];
            });

            const result = {
                dataValues: []
            };

            //console.log(mapping);
            dataValues.forEach(source => {

                result.dataValues.push({
                    "dataElement": mapping[`${source.dataElement}.${source.categoryOptionCombo}`],
                    "period": source.period,
                    "orgUnit": source.orgUnit,
                    "value": 1,
                    "storedBy": "IMA " + source.created,
                    "created": source.created
                });
            });
            return api.postData({
                data: result,
                //url: 'https://ima-assp.org/api/dataValueSets?importStrategy=CREATE'
                url: 'https://ima-assp.org/api/dataValueSets?skipAudit=true'
            });
        })
        .then((response) => {
            mailer.sendMail(JSON.stringify(response), 'Import Exhaustivity Nutrition');
        }).catch(err => {
            mailer.sendMail('Fail!!! Import Exhaustivity Nutrition', 'Fail!!! Import Exhaustivity Nutrition' + JSON.stringify(err));
        });

}