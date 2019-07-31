const PubgAPIEndpoint = require('./base.js');

module.exports = class PlayersPubgAPI extends PubgAPIEndpoint.PubgAPIEndpoint {
  get (id) {
    return this.api.axios.get(`/players/${id}`);
  }

  getSeasonStats (playerId, seasonId) {
    return this.api.axios.get(`/players/${playerId}/seasons/${seasonId}`);
  }

  listByID (playerIDs) {
    return this.api.axios.get('/players', { params: { 'filter[playerIds]': playerIDs.join(',') } });
  }

  listByName (playerNames) {
    return this.api.axios.get('/players', { params: { 'filter[playerNames]': playerNames.join(',') } });
  }
};
