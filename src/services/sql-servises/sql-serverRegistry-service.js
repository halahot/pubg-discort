const db = require('../../../configs/sql-config.js');
module.exports = class SqlServerRegisteryService {
  /**
     * Adds a user from a server's registery
     * @param {string} pubgId
     * @param {string} serverId
     * @returns {Promise<boolean>} if add was successful
     */
  static async registerUserToServer (pubgId, serverId) {
    let res = db.run(`select fk_servers_id
            from server_registery
            where fk_players_id=(select id from players where pubg_id=$1) and
            fk_servers_id=(select id from servers where server_id=$2)`, [pubgId, serverId], (err, row) => {

    if (row === 0) {
      res = await db.run(`insert into server_registery
                (fk_players_id, fk_servers_id)
                values (
                    (select id from players where pubg_id=$1), (select id from servers where server_id=$2)
                )`, [pubgId, serverId]);
      return true;
    } else if (row === 1) {
      return true;
    }
    return false;
  });
  }
  /**
     * Removes a user from a server's registery
     * @param {string} pubgId
     * @param {string} serverId
     * @returns {Promise<boolean>} boolean if delete was successful
     */
  static async unRegisterUserToServer (pubgId, serverId) {
    await db.run(`delete from server_registery
            where fk_players_id=(select id from players where pubg_id=$1) and
            fk_servers_id=(select id from servers where server_id=$2)`, [pubgId, serverId], (err, row) => {

      if (row) {
        return true;
      }
      return false;
    });
  }

  /**
     * Returns all users that are registered to a server's registery
     * @param {string} serverId
     * @returns {Promise<Player[]>} list of players on the server
     */
  static async getRegisteredPlayersForServer (serverId) {
    const res = await db.run(`select P.pubg_id, P.username, P.platform
            from server_registery as R
            left join players as P on R.fk_players_id = P.id
            where fk_servers_id = (select id from servers where server_id=$1)`, [serverId], (err, row) => {

    if (row == 0) {
      return row;
    }
    return [];
  });
 }
};
