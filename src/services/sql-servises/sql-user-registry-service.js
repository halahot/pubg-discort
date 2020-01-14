const db = require('../../../configs/sql-config.js');
const CacheService = require('../cashe-service.js');
const constants = require('../../shared/constants');

const cache = new CacheService();

module.exports = class SqlUserRegisteryService {
  static getCacheKey (discordId) {
    return `sql.userRegistery.getRegisteredUser-${discordId}`;
  }

  static async getRegisteredUser (discordId) {
    const cacheKey = this.getCacheKey(discordId);
    const ttl = constants.TIME_IN_SECONDS.ONE_MINUTE;
    const storeFunction = async () => {
      const query = `select P.username, P.platform from user_registery as UR left join players as P on P.id = UR.fk_players_id where discord_id = $1`;
      await db.run(query, [discordId], (_err, row) => {
        if (row) {
          return row;
        }
        return null;
      });
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

    const query = `select * from user_registery where discord_id = $1`;
    db.run(query, [discordId], (_err, row) => {
      if (row === 0) {
        db.run(`insert into user_registery
                (discord_id, fk_players_id)
                values ($1, (select id from players where pubg_id=$2))`, [discordId, pubgId]
        );
        return true;
      } else {
        db.run(`update user_registery
                set
                    fk_players_id=(select id from players where pubg_id=$2)
                where discord_id = $1`, [discordId, pubgId]
        );
        return true;
      }
    });
  }

  /**
     * Removes a user from the registery
     * @param {string} discordId
     */
  static async unRegisterUser (discordId) {
    const cacheKey = this.getCacheKey(discordId);
    cache.del(cacheKey);

    return db.run(`delete from user_registery where discord_id = $1`, [discordId]);
  }
};
