import * as pool from '../../config/sql.config';
import { IPlayer } from '../../interfaces';
import { QueryResult } from 'pg';


export default class SqlServerRegisteryService {

    /**
     * Adds a user from a server's registery
     * @param {string} pubgId
     * @param {string} serverId
     * @returns {Promise<boolean>} if add was successful
     */
    static async registerUserToServer(pubgId, serverId) {
        let res = await pool.query(`select fk_servers_id
            from server_registery
            where fk_players_id=(select id from players where pubg_id=$1) and
            fk_servers_id=(select id from servers where server_id=$2)`, [pubgId, serverId]);

        if (res.rowCount === 0) {
            res = await pool.query(`insert into server_registery
                (fk_players_id, fk_servers_id)
                values (
                    (select id from players where pubg_id=$1), (select id from servers where server_id=$2)
                )`, [pubgId, serverId]);
            return true;
        } else if (res.rowCount === 1) {
            return true;
        }
        return false;
    }

    /**
     * Removes a user from a server's registery
     * @param {string} pubgId
     * @param {string} serverId
     * @returns {Promise<boolean>} boolean if delete was successful
     */
    static async unRegisterUserToServer(pubgId, serverId) {
        const res = await pool.query(`delete from server_registery
            where fk_players_id=(select id from players where pubg_id=$1) and
            fk_servers_id=(select id from servers where server_id=$2)`, [pubgId, serverId]);

        if (res.rowCount === 1) {
            return true;
        }
        return false;
    }

    /**
     * Returns all users that are registered to a server's registery
     * @param {string} serverId
     * @returns {Promise<Player[]>} list of players on the server
     */
    static async getRegisteredPlayersForServer(serverId) {
        const res = await pool.query(`select P.pubg_id, P.username, P.platform
            from server_registery as R
            left join players as P on R.fk_players_id = P.id
            where fk_servers_id = (select id from servers where server_id=$1)`, [serverId]);

        if (res.rowCount != 0) {
            return res.rows;
        }
        return [];
    }
}
