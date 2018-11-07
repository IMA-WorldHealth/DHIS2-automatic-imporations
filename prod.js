const fs = require('fs');
const request = require('request-promise-native');
const mailer = require('./mailer');
module.exports.postData = (auth) => {


	(async () => {
		try {

			// create the pyramid of health                                                                                                                                                                               
			// await request.post(`${API}/execute`, { auth });                                                                                                                                                               

			// download the dataset                                                                                                                                                                                       
			let source = await request.get(`
        https://ima-assp.org/api/analytics/dataValueSet.json?dimension=dx:DQiMxAlXTOe&dimension=pe:LAST_3_MONTHS&dimension=qRZwzI8PYTJ:XZqSZpJycKJ&dimension=ou:LEVEL-5;s7ZjqzKnWsJ&displayProperty=NAME`, {
				auth
			});

			// process the pyramid into key/value pairs                                                                                                                                                                   

			let source2 = await request.get(
				`https://ima-assp.org/api/organisationUnits?fields=id,name,dataSets[id,name]&filter=dataSets.id:in:[zdGNLhp4xAB,pJxcWVobpl2]&paging=false`, {
					auth
				});

			source = JSON.parse(source);

			source2 = JSON.parse(source2);

			const dataValues = source.dataValues;

			const dataMap = {};
			var periods = [];

			//donnees apres elimination de doublons par period et unite d'orgabisation
			var lastData = [];

			// regroupons les donnees par period
			dataValues.forEach(ligne => {
				if (!dataMap[ligne.period]) {
					dataMap[ligne.period] = [];
					periods.push(ligne.period);
				}
				dataMap[ligne.period].push(ligne);
			});


			// detectons les elements à ecarter apres regroupement par period
			periods.forEach(period => {
				var orgUnits = {};
				var datasPeriod = dataMap[period]; // les donnees pour une periode

				datasPeriod.forEach(dataPeriod => {

					if (orgUnits[dataPeriod.orgUnit]) {
						dataPeriod.Aecarter = true; // trouvE
					} else {
						orgUnits[dataPeriod.orgUnit] = true;
					}

				});

				lastData.push(datasPeriod.filter(row => {
					return !row.Aecarter;
				}));

			});

			//  lastdata contient des tableaus car les donnees etaient regrouper en period
			// lastdata = [[{}, {}], [{}, {}]]
			// on le rend sous une forme simple d'un tableau d'objets
			// lastdata = [{}, {}]
			var lastDatatemp = [];
			lastData.forEach(row => {
				row.forEach(ligne => {
					lastDatatemp.push(ligne);
				});
			});

			lastData = lastDatatemp;

			const datasetUUID = ['zdGNLhp4xAB', 'pJxcWVobpl2']
			const organisationUnits = source2.organisationUnits;
			datasetMap = {};

			organisationUnits.forEach(orgUnit => {
				const datasets = orgUnit.dataSets;
				datasets.forEach(dataset => {
					if (datasetUUID.includes(dataset.id)) {
						datasetMap[orgUnit.id] = dataset.id;
					}
				})

			})


			const result = {
				completeDataSetRegistrations: []
			};

			lastData.forEach(ligne => {

				result.completeDataSetRegistrations.push({
					"period": ligne.period,
					"dataSet": datasetMap[ligne.orgUnit],
					"organisationUnit": ligne.orgUnit,
					"attributeOptionCombo": "c6PwdArn3fZ",
					"date": ligne.created,
					"storedBy": "IMA " + ligne.created
				});
			});
			// console.log(result);

			request({
				url: 'https://ima-assp.org/api/completeDataSetRegistrations',
				method: 'POST',
				json: result,
				auth
			}, function (error, response, body) {

				if (!error) {
					mailer.sendMail('prod', 'DHIS2 automatic importations for prod');
				}
				console.log(body);
			});

		} catch (e) {
			console.error('An error occured:', e);
		}
	})();
}