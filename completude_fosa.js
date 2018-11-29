const API = require('./lib/dhis2-api');
const mailer = require('./mailer');

module.exports.postData = (auth) => {

	const api = new API({
		credentials: auth,
		url: `https://ima-assp.org/api/analytics/dataValueSet.json`
	});
	let source;
	const query = 'dimension=dx:DQiMxAlXTOe&dimension=pe:LAST_3_MONTHS&dimension=qRZwzI8PYTJ:XZqSZpJycKJ&dimension=ou:LEVEL-5;s7ZjqzKnWsJ&displayProperty=NAME';
	
	const url2 = 'https://ima-assp.org/api/organisationUnits';
	const query2 = 'fields=id,name,dataSets[id,name]&filter=dataSets.id:in:[zdGNLhp4xAB,pJxcWVobpl2]&paging=false';
	// download the Data                                                                                                                                                                                       
	api.analytics({
			query
		})
		.then(_source => {
			source = _source;
			return api.analytics({
				url: url2,
				query: query2
			});
		}).then(source2 => {

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

			return api.postData({
				data: result,
				url: 'https://ima-assp.org/api/completeDataSetRegistrations'
			});
		})
		.then(() => {
      mailer.sendMail('success!!! Import Completness for FOSA', 'Import Completness for FOSA');
    }).catch(err => {
      mailer.sendMail('Fail!!! Import Completness for FOSA', 'Fail!!! Import Completness for FOSA' + JSON.stringify(err));
    });

}