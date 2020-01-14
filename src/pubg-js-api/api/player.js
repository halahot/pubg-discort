const PubgAPIEndpoint = require('./base.js');
module.exports = class PlayersPubgAPI extends PubgAPIEndpoint.PubgAPIEndpoint {
  get (id) {
    return this.api._axios.get(`/players/${id}`);
  }

  getSeasonStats (playerId, seasonId) {
    return this.api._axios.get(`/players/${playerId}/seasons/${seasonId}`);
  }

  listByID (playerIDs) {
    return this.api._axios.get('/players', { params: { 'filter[playerIds]': playerIDs.join(',') } });
  }

  listByName (playerNames) {
    return this.api._axios.get('/players', { params: { 'filter[playerNames]': playerNames.join(',') } });
  }
};
