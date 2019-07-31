const GameModeStats = require('./GameModeStats.js');
const PlayersPubgAPI = require('../api/player.js');

/**
 * Statistics for a player in a given season.
 *
 * Initialize this by calling the `get` method with an instance of `PubgAPI`, a player ID and
 * a season ID.
 *
 */
module.exports = class PlayerSeason {
  constructor (playerSeason) {
    const relationships = playerSeason.data.relationships;
    this._playerId = relationships.player.data.id;
    this._seasonId = relationships.season.data.id;

    const gameModesStats = playerSeason.data.attributes.gameModeStats;
    this._duoStats = new GameModeStats(gameModesStats.duo);
    this._duoFPPStats = new GameModeStats(gameModesStats['duo-fpp']);

    this._soloStats = new GameModeStats(gameModesStats.solo);
    this._soloFPPStats = new GameModeStats(gameModesStats['solo-fpp']);

    this._squadStats = new GameModeStats(gameModesStats.squad);
    this._squadFPPStats = new GameModeStats(gameModesStats['squad-fpp']);
  }

  static async get (api, playerId, seasonId) {
    const playerAPI = new PlayersPubgAPI(api);
    const seasonData = await playerAPI.getSeasonStats(playerId, seasonId);
    return PlayerSeason.fromSeasonData(seasonData.data);
  }

  static fromSeasonData (seasonData) {
    return new PlayerSeason(seasonData);
  }

  get playerId () {
    return this._playerId;
  }

  get seasonId () {
    return this._seasonId;
  }

  get duoFPPStats () {
    return this._duoFPPStats;
  }

  get duoStats () {
    return this._duoStats;
  }

  get soloFPPStats () {
    return this._soloFPPStats;
  }

  get soloStats () {
    return this._soloStats;
  }

  get squadFPPStats () {
    return this._squadFPPStats;
  }

  get squadStats () {
    return this._squadStats;
  }
};
