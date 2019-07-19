import { AxiosPromise } from 'axios';

import { PubgAPIEndpoint } from './base.js';


export class PlayersPubgAPI extends PubgAPIEndpoint {

  get(id){
    return api.axios.get(`/players/${id}`);
  }

  getSeasonStats(playerId, seasonId) {
    return this.api.axios.get(`/players/${playerId}/seasons/${seasonId}`);
  }

  listByID(playerIDs) {
    return this.api.axios.get('/players', {params: {'filter[playerIds]': playerIDs.join(',')}});
  }

  listByName(playerNames) {
    return this.api.axios.get('/players', {params: {'filter[playerNames]': playerNames.join(',')}});
  }

}