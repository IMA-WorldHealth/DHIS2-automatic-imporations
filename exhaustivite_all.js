const fs = require('fs');
const API = require('./lib/dhis2-api');
const mailer = require('./mailer');

module.exports.postData = (auth) => {

    const api = new API({
        credentials: auth,
        url: `https://ima-assp.org/api/analytics/dataValueSet.json`
    });

    const PERIOD = 'LAST_3_MONTHS';
    //const PERIOD = '202101;202102;202103';
    const query = `dimension=dx:t2O2Sf4Kngw;DQiMxAlXTOe;w8zw7gMZQvu&dimension=pe:${PERIOD}&dimension=ou:OU_GROUP-WJ5VCUtdTtD;s7ZjqzKnWsJ&displayProperty=NAME`;
    //const query = `dimension=dx:t2O2Sf4Kngw;DQiMxAlXTOe;w8zw7gMZQvu&dimension=pe:LAST_3_MONTHS&dimension=ou:OU_GROUP-WJ5VCUtdTtD;s7ZjqzKnWsJ&displayProperty=NAME`;
    // download the Data                                                                                                                                                                                       
    api.analytics({
            query
        })
        .then(source => {
            const dataValues = source.dataValues;
            //const dataValues = request1.dataValues;

            const dataElementval = ['t2O2Sf4Kngw','DQiMxAlXTOe','w8zw7gMZQvu'];
            const dataElementExh = ['zNLo4MDcnyI','NFzQu6qEDwp','cVmp8NMP04Z'];
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
                    "dataElement": mapping[`${source.dataElement}`],
                    "period": source.period,
                    "orgUnit": source.orgUnit,
                    "value": 1,
                    "storedBy": "IMA " + source.created,
                    "created": source.created
                });
            });
            
            fs.writeFileSync('./exhaustivite_All.json', JSON.stringify(result));

            return api.postData({
                data: result,
                 url: 'https://ima-assp.org/api/dataValueSets?skipAudit=true'
                //url: 'https://dev.ima-assp.org/api/dataValueSets?skipAudit=true'
            });
        })
        .then((response) => {
            mailer.sendMail(JSON.stringify(response), 'Import Exhaustivity for all Organisation Unit');
        }).catch(err => {
            mailer.sendMail('Fail!!! Import Exhaustivity for all Organisation Unit', 'Fail!!! Import Exhaustivity for all Organisation Unit' + JSON.stringify(err));
 });
};
