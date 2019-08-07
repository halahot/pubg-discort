const CacheService = require('../cashe-service.js');
const SqlPlayersService = require('../sql-servises/sql-player-servise.js');
const Player = require('../../pubg-js-api/api/player.js');
const PlayerSeason = require('../../pubg-js-api/entities/PlayerSeason.js');
const constants = require('../../shared/constants.js');
const PubgSeasonService = require('./season-service.js');
const cache = new CacheService();

module.exports = class PubgPlayerService {
  /**
     * Returns a pubg character id
     * @param {PubgAPI} api
     * @param {string} name
     * @returns {Promise<string>} a promise that resolves to a pubg id
     */
  static async getPlayerId (api, name) {
    const platform = api.platform;
    const player = await SqlPlayersService.getPlayer(name, platform);

    if (player && player.pubg_id && player.pubg_id !== '') {
      return player.pubg_id;
    } else {
      return await this.getPlayerIdByName(api, name);
    }
  }

  /**
     * Get player(s) by id
     * @param {PubgAPI} api
     * @param {string[]} ids
     * @returns {Promise<string>} a promise that resolves to a pubg id
     */
  static async getPlayersById (api, ids) {
    const cacheKey = `pubgApi.getPlayersById-${api.platformRegion}-${ids}`;
    const ttl = constants.TIME_IN_SECOND.FIVE_MINUTES;
    const storeFunction = async () => {
      return Player.filterById(api, ids).catch(() => []);
    };

    return await cache.get(cacheKey, storeFunction, ttl);
  }

  /**
     * Get player(s) by name
     * @param {PubgAPI} api
     * @param {string[]} names
     * @returns {Promise<Player[]>} list of player(s)
     */
  static async getPlayersByName (api, names) {
    const cacheKey = `pubgApi.getPlayersByName-${api.platformRegion}-${names}`;
    const ttl = constants.TIME_IN_SECOND.FIVE_MINUTES;
    const storeFunction = async () => {
      return Player.filterByName(api, names).catch(() => []);
    };

    return await cache.get(cacheKey, storeFunction, ttl);
  }

  /**
     * Get a player's id
     * @param {PubgAPI} api
     * @param {string[]} names
     * @returns {Promise<string>} a player's id
     */
  static async getPlayerIdByName (api, name) {
    const cacheKey = `pubgApi.getPlayerIdByName-${name}-${api.platformRegion}`;
    const ttl = constants.TIME_IN_SECOND.ONE_MINUTE;
    const storeFunction = async () => {
      const result = await this.getPlayersByName(api, [name]);

      if (result.length === 0) { return ''; }

      const player = result[0];
      const platform = 'steam';
      await SqlPlayersService.addPlayer(player.name, player.id, platform);
      return player.id;
    };

    return await cache.get(cacheKey, storeFunction, ttl);
  }

  /**
     * Retreives a player's season stats for the specified season
     * @param {PubgAPI} api
     * @param {string} id
     * @param {string} season
     * @returns {Promise<PlayerSeason>}
     */
  static async getPlayerSeasonStatsById (api, id, season) {
    const cacheKey = `pubgApi.getPlayerSeasonStatsById-${id}-${season}-${api.platformRegion}`;
    const ttl = constants.TIME_IN_SECOND.FIFTHTEEN_MINUTES;
    const storeFunction = async () => {
      const seasonId = PubgSeasonService.getPubgSeasonId(season);
      return PlayerSeason.get(api, id, seasonId).catch(() => null);
    };

    return await cache.get(cacheKey, storeFunction, ttl);
  }

  static async getPlayers() {
    const cacheKey = `pubgApi.getPlayers-steam`;
    const ttl = constants.TIME_IN_SECOND.FIVE_MINUTES;
    const storeFunction = async () => {
      return SqlPlayersService.getPlayers();
    };

    return await cache.get(cacheKey, storeFunction, ttl);
  }
};
