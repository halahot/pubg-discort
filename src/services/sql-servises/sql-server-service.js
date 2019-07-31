const pool = require('../../../configs/sql-config.js');
const CacheService = require('../cashe-service.js');
const constants = require('../../shared/constants');

const cache = new CacheService();
module.exports = class SqlServerService {
  /**
     * Adds a server to the servers table if it doesn't exist already
     * @param {string} serverId
     */
  static async registerServer (serverId) {
    const res = await pool.query('select server_id from servers where server_id = $1', [serverId]);
    if (res.rowCount === 0) {
      return pool.query(`insert into servers
                (server_id, default_bot_prefix, default_region, default_mode)
                values ($1, $2, $3, $4)`,
      [serverId, '!pubg-', 'PC_NA', 'SQUAD_FPP']);
    }
  }

  /**
     * Removes a server from the servers table
     * @param {string} serverId
     * @returns {boolean} server unregistered successfully
     */
  static async unRegisterServer (serverId) {
    await pool.query('delete from servers where server_id=$1', [serverId]);
    return true;
  }

  /**
     * Get the sever's default settings
     * @param {string} serverId
     * @returns {Server} server
     */
  static async getServer (serverId) {
    const cacheKey = `sql.server.getServer-${serverId}`; // This must match the key in setServerDefaults
    const ttl = constants.TIME_IN_SECONDS.FIVE_MINUTES;
    const storeFunction = async () => {
      const res = await pool.query('select * from servers where server_id = $1', [serverId]);

      // This handles the very small window in time where the server hasn't been added to the database but messages are coming through
      if (res.rowCount === 0) {
        return {
          id: '',
          serverId: '',
          default_bot_prefix: '!',
          default_region: 'PC_NA',
          default_mode: 'SQUAD_FPP',
          isStoredInDb: false
        };
      } else {
        return {
          id: '',
          serverId: res.rows[0].id,
          default_bot_prefix: res.rows[0].default_bot_prefix,
          default_region: res.rows[0].default_region,
          default_mode: res.rows[0].default_mode,
          isStoredInDb: true
        };
      }
    };

    return await cache.get(cacheKey, storeFunction, ttl);
  }

  /**
     * Sets the server's default settings
     * @param {string} serverId of server
     * @param {string} botPrefix for all bot commands
     * @param {string} season of PUBG
     * @param {string} region of PUBG
     * @param {string} mode fpp or tpp
     */
  static async setServerDefaults (serverId, botPrefix, region, mode) {
    const cacheKey = `sql.server.getServer-${serverId}`; // This must match the key in getServer
    cache.del(cacheKey);

    const res = await pool.query('select server_id from servers where server_id = $1', [serverId]);
    if (res.rowCount === 0) {
      return pool.query('insert into servers (server_id, default_bot_prefix, default_region, default_mode) values ($1, $2, $3, $4)', [serverId, botPrefix, region, mode]);
    }
    return pool.query('update servers set default_bot_prefix=$2, default_region=$3, default_mode=$4 where server_id = $1', [serverId, botPrefix, region, mode]);
  }

  static deleteServerCache (serverId) {
    const cacheKey = `sql.server.getServer-${serverId}`; // This must match the key in getServer
    cache.del(cacheKey);
  }
};
