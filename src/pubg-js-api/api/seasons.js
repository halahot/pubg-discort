const PubgAPIEndpoint = require('./base.js');

module.exports = class SeasonsPubgAPI extends PubgAPIEndpoint.PubgAPIEndpoint {
  list () {
    return this._api._axios.get(`/seasons`);
  }
};
