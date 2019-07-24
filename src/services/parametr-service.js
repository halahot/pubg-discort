import { CommonService } from './common-service.js';
import { PubgSeasonService } from './pubg-api/';
import { SqlUserRegisteryService } from './sql-servises/sql-user-registry-service.js';
import { PubgPlatformService } from './pubg-api/';
// import { Season } from '../pubg-typescript-api';

export class ParameterService {

    /**
     * Gets common PUBG parameters with an optional username
     * @param {string} params  string of params
     * @param {string} msgAuthorId discord msg author id
     * @param {boolean} getUsername
     * @param {Server} serverDefaults
     */
    static async getPubgParameters(params, msgAuthorId, getUsername, serverDefaults) {
        // const regExr = /^(.*?)\s?(region=\S+|season=\S+|mode=\S+)?\s?(region=\S+|season=\S+|mode=\S+)?\s?(region=\S+|season=\S+|mode=\S+)?$/
        // const result = params.match(regExr);

        const result = params;
        const param_location = {
            match: 0,
            username: 1
        };

        //const fullMatch: string = result[param_location.match];
        let parameters;
        const username = result[param_location.username];
        const potential_region_season_mode = [result[param_location.region_season_mode_1], result[param_location.region_season_mode_2], result[param_location.region_season_mode_3]];

        if (serverDefaults) {
            parameters = {
                username: username,
                region: this.getParamValue('region=', potential_region_season_mode, serverDefaults.default_region).toUpperCase().replace('-', '_'),
                season: this.getParamValue('season=', potential_region_season_mode, null),
                mode: this.getParamValue('mode=', potential_region_season_mode, serverDefaults.default_mode).toUpperCase().replace('-', '_'),
            };
        } else {
            const region = this.getParamValue('region=', potential_region_season_mode, 'steam').toUpperCase().replace('-', '_');
            const api = PubgPlatformService.getApi();
            const currentSeason = await PubgSeasonService.getCurrentSeason(api);
            const currentSeasonName = PubgSeasonService.getSeasonDisplayName(currentSeason);

            parameters = {
                username: username,
                region: region,
                season: this.getParamValue('season=', potential_region_season_mode, currentSeasonName),
                mode: this.getParamValue('mode=', potential_region_season_mode, 'solo_fpp').toUpperCase().replace('-', '_'),
            };
        }

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

    /**
     * Returns the value of the key=value pair.
     * @param {string} search parameter to search for
     * @param {array} params array of parameters to search through
     * @param {string} defaultParam default return value if search does not exist
     */
    static getParamValue(search, params, defaultParam) {
        if (!params) { return defaultParam; }

        let index = CommonService.isSubstringOfElement(search, params);
        if (index >= 0) {
            return params[index].slice(params[index].indexOf('=') + 1).toLowerCase();
        } else {
            return defaultParam;
        }
    }

}