module.exports = class GameModeStats {
  constructor (playerSeason) {
    this._damageDealt = playerSeason.damageDealt;
    this._kills = playerSeason.kills;
    this._longestKill = playerSeason.longestKill;
    this._losses = playerSeason.losses;
    this._maxKillStreaks = playerSeason.maxKillStreaks;
    this._roundsPlayed = playerSeason.roundsPlayed;
  }

  get damageDealt () {
    return this._damageDealt;
  }

  get kills () {
    return this._kills;
  }

  get longestKill () {
    return this._longestKill;
  }

  get losses () {
    return this._losses;
  }

  get roundsPlayed () {
    return this._roundsPlayed;
  }

  get maxKillStreaks () {
    return this._maxKillStreaks;
  }
};
