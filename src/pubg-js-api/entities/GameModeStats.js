export default class GameModeStats {
    constructor(playerSeason) {
        this._assists = playerSeason.assists;
        this._bestRankPoint = playerSeason.bestRankPoint;
        this._boosts = playerSeason.boosts;
        this._dBNOs = playerSeason.dBNOs;
        this._dailyKills = playerSeason.dailyKills;
        this._dailyWins = playerSeason.dailyWins;
        this._damageDealt = playerSeason.damageDealt;
        this._days = playerSeason.days;
        this._headshotKills = playerSeason.headshotKills;
        this._heals = playerSeason.heals;
        this._killPoints = playerSeason.killPoints;
        this._kills = playerSeason.kills;
        this._longestKill = playerSeason.longestKill;
        this._longestTimeSurvived = playerSeason.longestTimeSurvived;
        this._losses = playerSeason.losses;
        this._maxKillStreaks = playerSeason.maxKillStreaks;
        this._mostSurvivalTime = playerSeason.mostSurvivalTime;
        this._rankPoints = playerSeason.rankPoints;
        this._rankPointsTitle = playerSeason.rankPointsTitle;
        this._revives = playerSeason.revives;
        this._rideDistance = playerSeason.rideDistance;
        this._roadKills = playerSeason.roadKills;
        this._roundMostKills = playerSeason.roundMostKills;
        this._roundsPlayed = playerSeason.roundsPlayed;
        this._suicides = playerSeason.suicides;
        this._swimDistance = playerSeason.swimDistance;
        this._teamKills = playerSeason.teamKills;
        this._timeSurvived = playerSeason.timeSurvived;
        this._top10s = playerSeason.top10s;
        this._vehicleDestroys = playerSeason.vehicleDestroys;
        this._walkDistance = playerSeason.walkDistance;
        this._weaponsAcquired = playerSeason.weaponsAcquired;
        this._weeklyKills = playerSeason.weeklyKills;
        this._weeklyWins = playerSeason.weeklyWins;
        this._winPoints = playerSeason.winPoints;
        this._wins = playerSeason.wins;
      }
    
      get assists() {
        return this._assists;
      }
    
      get bestRankPoint() {
        return this._bestRankPoint;
      }
    
      get boosts() {
        return this._boosts;
      }
    
      get dBNOs() {
        return this._dBNOs;
      }
    
      get dailyKills() {
        return this._dailyKills;
      }
    
      get dailyWins() {
        return this._dailyWins;
      }
    
      get damageDealt() {
        return this._damageDealt;
      }
    
      get days() {
        return this._days;
      }
    
      get headshotKills() {
        return this._headshotKills;
      }
    
      get heals() {
        return this._heals;
      }
    
      get killPoints() {
        return this._killPoints;
      }
    
      get kills() {
        return this._kills;
      }
    
      get longestKill() {
        return this._longestKill;
      }
    
      get longestTimeSurvived() {
        return this._longestTimeSurvived;
      }
    
      get losses() {
        return this._losses;
      }
    
      get maxKillStreaks() {
        return this._maxKillStreaks;
      }
    
      get mostSurvivalTime() {
        return this._mostSurvivalTime;
      }
    
      get rankPoints() {
        return this._rankPoints;
      }
    
      get rankPointsTitle() {
        return this._rankPointsTitle;
      }
    
      get revives() {
        return this._revives;
      }
    
      get rideDistance() {
        return this._rideDistance;
      }
    
      get roadKills() {
        return this._roadKills;
      }
    
      get roundMostKills() {
        return this._roundMostKills;
      }
    
      get roundsPlayed() {
        return this._roundsPlayed;
      }
    
      get suicides() {
        return this._suicides;
      }
    
      get swimDistance() {
        return this._swimDistance;
      }
    
      get teamKills() {
        return this._teamKills;
      }
    
      get timeSurvived() {
        return this._timeSurvived;
      }
    
      get top10s() {
        return this._top10s;
      }
    
      get vehicleDestroys() {
        return this._vehicleDestroys;
      }
    
      get walkDistance() {
        return this._walkDistance;
      }
    
      get weaponsAcquired() {
        return this._weaponsAcquired;
      }
    
      get weeklyKills() {
        return this._weeklyKills;
      }
    
      get weeklyWins() {
        return this._weeklyWins;
      }
    
      get winPoints() {
        return this._winPoints;
      }
    
      get wins() {
        return this._wins;
      }
}