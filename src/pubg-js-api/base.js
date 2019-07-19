import axios from 'axios';

class PubgAPI {

    constructor(apiKey, platformRegion) {
        this._apiKey = apiKey;
        this._platformRegion = platformRegion;
        const headers = {
          'Authorization': `Bearer ${this._apiKey}`,
          'Accept': 'application/json',
        };

       /*  if (useGzip) {
          headers['Accept-Encoding'] = 'gzip';
        } */

        this._axios = axios.create({
          baseURL: `https://api.playbattlegrounds.com/shards/${this._platformRegion}/`,
          headers: headers,
        });
      }
    
       /**
   * The AxiosInstance used to make authenticated API requests.
   */
    get axios() {
       return this._axios;
    }
  
    /**
     * Platform and Region associated with this API instance.
     */
    get platformRegion() {
       return this._platformRegion;
    }  
}

class PubgAPIEndpoint {
    
    constructor(api) {
      this._api = api;
    }
  
    get api() {
      return this._api;
    }
}

export default {
    PubgAPI,
    PubgAPIEndpoint
};