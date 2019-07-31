const pool = require('../../../configs/sql-config.js');
const CacheService = require('../cashe-service.js');
const constants = require('../../shared/constants.js');

const cache = new CacheService();
const platform = 'steam';

module.exports = class SqlPlayersService {
  static getCacheKey (username) {
    return `sql.player.getPlayer-${username}-${platform}`;
  }

  /**
     * Adds a player to the player table
     * @param {string} username
     * @param {string} pubgId
     */
  static async addPlayer (username, pubgId) {
    const cacheKey = this.getCacheKey(username, platform);
    cache.del(cacheKey);

    const res = await pool.query('select * from players where pubg_id = $1 and platform = $2', [pubgId, platform]);
    if (res.rowCount === 0) {
      return await pool.query('insert into players (pubg_id, username, platform) values ($1, $2, $3)', [pubgId, username, platform]);
    } else {
      const player = res.rows[0];
      if (player.username !== username) {
        return await pool.query('update players set username = $2 where pubg_id = $1 and platform = $3', [pubgId, username, platform]);
      }
    }
  }

  /**
     * Gets a player from their username
     * @param {string} username
     */
  static async getPlayer (username) {
    const cacheKey = this.getCacheKey(username, platform);
    const ttl = constants.TIME_IN_SECONDS.FIVE_MINUTES;
    const storeFunction = async () => {
      const res = await pool.query('select * from players where username = $1 and platform = $2', [username, platform]);
      if (res.rowCount === 1) {
        return res.rows[0];
      }
    };

    return await cache.get(cacheKey, storeFunction, ttl);
  }
}
