const request = require('request-promise-native');
const q = require('q');

/*
  This API is reponsible for interating(sending request) with DHIS2 application
  It provides methods for retrieving and posting data to DHIS2
*/
class API {
  /**
     * @constructor
     * @param {*} params an object that contains credentials, url and version if necessary
     */
  constructor(params) {
    this.auth = params.credentials;
    this.url = params.url;
    this.version = params.version;
  }

  /**
     * @function analytics Get data from DHIS2 application
     * @param {*} params contains the query string, an url can be provided if needed
     *
     */
  analytics(params) {
    const { url, query } = params;
    const deferred = q.defer();
    request.get(`${url || this.url}?${query}`, { auth: this.auth })
      .then((data) => {
        if (typeof (data) === 'string') {
          data = JSON.parse(data);
        }
        return deferred.resolve(data);
      }).catch((err) => deferred.reject(err));

    return deferred.promise;
  }

  /**
     * @function postData posting data to DHIS2 app
     * @param {*} params equals { data : dataToPost, url },
     *  if no url provided then the default one (used in this api constructor) will be used
     */
  postData(params) {
    const deferred = q.defer();
    request({
      url: params.url || this.url,
      method: 'POST',
      json: params.data,
      auth: this.auth,
    }, (error, response, body) => {
      if (!error) {
        return deferred.resolve(response);
      }
      return deferred.reject(error);
    });

    return deferred.promise;
  }
}

module.exports = API;
