import { PubgAPIEndpoint } from './base';


export class SeasonsPubgAPI extends PubgAPIEndpoint {
  list() {
    return this.api.axios.get(`/seasons`);
  }
}