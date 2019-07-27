import { PubgSeasonService , PubgPlatformService } from './pubg-api/';
import { SqlUserRegisteryService } from './sql-servises/sql-user-registry-service.js';

// import { Season } from '../pubg-typescript-api';

export class ParameterService {
  /**
     * Gets common PUBG parameters with an optional username
     * @param {string} params  string of params
     * @param {string} msgAuthorId discord msg author id
     * @param {boolean} getUsername
     * @param {Server} serverDefaults
     */
  static async getPubgParameters (params, msgAuthorId, getUsername) {
    const param_location = {
      match: 0,
      username: 1
    };

    // const fullMatch: string = result[param_location.match];
    let parameters;
    const username = params[param_location.username];
    const api = PubgPlatformService.getApi();
    const currentSeason = await PubgSeasonService.getCurrentSeason(api);
    const currentSeasonName = PubgSeasonService.getSeasonDisplayName(currentSeason);

    parameters = {
      username: username,
      season: currentSeasonName
    };

    // Try to get username from user registery
    if (getUsername && !parameters.username) {
      const player = await SqlUserRegisteryService.getRegisteredUser(msgAuthorId);
      if (player) {
        parameters.username = player.username;
      } else {
        parameters.username = '';
      }
    }

    return parameters;
  }
}
