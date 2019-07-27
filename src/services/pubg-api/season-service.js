const Season = require('../../pubg-js-api/api/seasons.js');
const constants = require('../../shared/constants.js');
const CacheService = require('../cashe-service.js');

const cache = new CacheService();
module.exports = class PubgSeasonService {
  /**
     * Get all available seasons
     */
  static async getAvailableSeasons (api) {
    const cacheKey = `pubgApi.getAvailableSeasons.${api.platformRegion}`;
    const ttl = constants.TIME_IN_SECONDS.ONE_HOUR;
    const storeFunction = async () => {
      let seasons = await Season.list(api);

      // Not supporting pre-release seasons
      seasons = seasons.filter(season => {
        const seasonId = season.id;
        return seasonId.indexOf('beta') === -1 && seasonId.indexOf('pre') === -1;
      });

      // hardcoding
      seasons.push({
        id: 'lifetime',
        _id: 'lifetime'
      });

      return seasons;
    };

    return await cache.get(cacheKey, storeFunction, ttl);
  }

  /**
     * Gets the current Season
     * @param api
     * @returns {Promise<Season>} The current season
     */
  static async getCurrentSeason (api) {
    const seasons = await this.getAvailableSeasons(api);
    return seasons.filter(season => season.isCurrentSeason)[0];
  }
};
