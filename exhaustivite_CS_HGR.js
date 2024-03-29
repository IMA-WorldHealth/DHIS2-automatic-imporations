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
    const query = `dimension=dx:WgZr7FrDfVn;kGmdIbd3mbn;TkAGe7FvxzX;zcH4sipFcUr;V7bWComPcDJ;P9o3bL76s2r;PFCz0A2SBtd;cTLKwfG8pSv&dimension=pe:${PERIOD}&dimension=ou:OU_GROUP-UJJSPTVYQt6;s7ZjqzKnWsJ&displayProperty=NAME`;
    //const query = `dimension=dx:WgZr7FrDfVn;kGmdIbd3mbn;TkAGe7FvxzX;zcH4sipFcUr;V7bWComPcDJ;P9o3bL76s2r;PFCz0A2SBtd;cTLKwfG8pSv&dimension=pe:LAST_3_MONTHS&dimension=ou:OU_GROUP-UJJSPTVYQt6;s7ZjqzKnWsJ&displayProperty=NAME`;
    // download the Data                                                                                                                                                                                       
    api.analytics({
            query
        })
        .then(source => {
            const dataValues = source.dataValues;
            //const dataValues = request1.dataValues;

            const dataElementval = ['WgZr7FrDfVn','kGmdIbd3mbn','TkAGe7FvxzX','zcH4sipFcUr','V7bWComPcDJ','P9o3bL76s2r','PFCz0A2SBtd','cTLKwfG8pSv'];
            const dataElementExh = ['vvzOIsNR5SE','eI7s8XvUore','twTFi7fp8wD','wMkTSZudDyO','pAWUuUgO5H0','HRQ10ivsurn','XNVeTlQHhBO','afE4UcxztvZ'];
            

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
            console.log("Run");
            fs.writeFileSync('./exhaustiviteCS-HGR.json', JSON.stringify(result));
            
            return api.postData({
                data: result,
                 url: 'https://ima-assp.org/api/dataValueSets?skipAudit=true'
                //url: 'https://dev.ima-assp.org/api/dataValueSets?skipAudit=true'
            });
        })
        .then((response) => {
            mailer.sendMail(JSON.stringify(response), 'Import Exhaustivity for CS and HGR');
        }).catch(err => {
            mailer.sendMail('Fail!!! Import Exhaustivity for CS and HGR', 'Fail!!! Import Exhaustivity for CS and HGR' + JSON.stringify(err));
});

};
