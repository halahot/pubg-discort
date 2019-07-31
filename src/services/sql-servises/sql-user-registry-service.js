const pool = require('../../../configs/sql-config.js');
const CacheService = require('../cashe-service.js');
const constants = require('../../shared/constants');

const cache = new CacheService();

module.exports = class SqlUserRegisteryService {
  static getTableName () {
    return 'user_registery';
  }

  static getCacheKey (discordId) {
    return `sql.userRegistery.getRegisteredUser-${discordId}`;
  }

  static async getRegisteredUser (discordId) {
    const cacheKey = this.getCacheKey(discordId);
    const ttl = constants.TIME_IN_SECONDS.ONE_MINUTE;
    const storeFunction = async () => {
      const query = `select P.username, P.platform from ${this.getTableName} as UR left join players as P on P.id = UR.fk_players_id where discord_id = $1`;
      const res = await pool.query(query, [discordId]);

      if (res.rowCount !== 0) {
        return res.rows[0];
      }
      return null;
    };

    return await cache.get(cacheKey, storeFunction, ttl);
  }

  /**
     * Adds a user  to the user_registery table if it doesn't exist already
     * @param {string} serverId
     */
  static async registerUser (discordId, pubgId) {
    const cacheKey = this.getCacheKey(discordId);
    cache.del(cacheKey);

    const query = `select * from ${this.getTableName} where discord_id = $1`;
    const res = await pool.query(query, [discordId]);

    if (res.rowCount === 0) {
      await pool.query(`insert into ${this.getTableName}
                (discord_id, fk_players_id)
                values ($1, (select id from players where pubg_id=$2))`, [discordId, pubgId]
      );
      return true;
    } else {
      await pool.query(`update ${this.getTableName}
                set
                    fk_players_id=(select id from players where pubg_id=$2)
                where discord_id = $1`, [discordId, pubgId]
      );
      return true;
    }
  }

  /**
     * Removes a user from the registery
     * @param {string} discordId
     */
  static async unRegisterUser (discordId) {
    const cacheKey = this.getCacheKey(discordId);
    cache.del(cacheKey);

    return pool.query(`delete from ${this.tableName} where discord_id = $1`, [discordId]);
  }
}
