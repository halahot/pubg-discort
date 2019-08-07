const axios = require('axios');
class PubgAPI {
  constructor (apiKey, platformRegion = 'steam') {
    this._apiKey = apiKey;
    this._platformRegion = platformRegion;
    const headers = {
      Authorization: `Bearer ${this._apiKey}`,
      Accept: 'application/json'
    };

    /*  if (useGzip) {
          headers['Accept-Encoding'] = 'gzip';
        } */

    this._axios = axios.create({
      baseURL: `https://api.pubg.com/shards/${this._platformRegion}/`,
      headers: headers
    });
  }
}

class PubgAPIEndpoint {
  constructor (api) {
    this._api = api;
  }

  get api () {
    return this._api;
  }
}

module.exports = {
  PubgAPI,
  PubgAPIEndpoint
};
