const db = require('../../../configs/sql-config.js');
const CacheService = require('../cashe-service.js');
const { TIME_IN_SECONDS } = require('../../shared/constants.js');

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

    await db.run('select * from players where pubg_id = $1 and platform = $2', [pubgId, platform], (_err, row) => {
      if (row === 0) {
        return db.run('insert into players (pubg_id, username, platform) values ($1, $2, $3)', [pubgId, username, platform]);
      } else {
        const player = row;
        if (player.username !== username) {
          return db.run('update players set username = $2 where pubg_id = $1 and platform = $3', [pubgId, username, platform]);
        }
      }
    });
  }

  /**
     * Gets a player from their username
     * @param {string} username
     */
  static async getPlayer (username) {
    const cacheKey = this.getCacheKey(username, platform);
    const ttl = TIME_IN_SECONDS.FIVE_MINUTES;
    const storeFunction = async () => {
      await db.run('select * from players where username = $1 and platform = $2', [username, platform], (err, row) => {
        if (err) {
          console.error(err.message);
        } else {
          return row;
        }
      });
    };

    return await cache.get(cacheKey, storeFunction, ttl);
  }

  static async getPlayers () {
    const cacheKey = this.getCacheKey(platform);
    const ttl = TIME_IN_SECONDS.FIVE_MINUTES;
    const storeFunction = async () => {
      await db.run('select * from players', (err, rows) => {
        if (err) {
          console.log(err);
        } else {
          return rows;
        }
      });
    };

    return await cache.get(cacheKey, storeFunction, ttl);
  }
};
