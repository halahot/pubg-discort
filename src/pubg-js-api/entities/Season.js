const SeasonsPubgAPI = require('../api/seasons.js');
/**
 * A PUBG Season.
 *
 * Contains ID and info on a Season. The season has an ID and two boolean values that indicate
 * whether or not it is the current season or if it is off-season.
 *
 * Use the `list` static method to get a list of all the seasons.
 */
module.exports = class Season {
  constructor (season) {
    this._id = season.id;
    this._isCurrentSeason = season.attributes.isCurrentSeason;
    this._isOffSeason = season.attributes.isOffseason;
  }

  /**
     * Return a complete list of Season objects from PUBG API.
     *
     * @param api instance of `PubgAPI` that will be used to make the API request
     */
  static async list (api) {
    const seasonsAPI = new SeasonsPubgAPI(api);
    const seasonsData = await seasonsAPI.list();
    return Season.fromList(seasonsData.data);
  }

  static fromList (seasonList) {
    const seasons = [];
    seasonList.data.forEach(season => {
      seasons.push(new Season(season));
    });

    return seasons;
  }

  get id () {
    return this._id;
  }

  /**
     * Indicates if the season is active.
     */
  get isCurrentSeason () {
    return this._isCurrentSeason;
  }

  /**
     * Indicates if the season is not active.
     */
  get isOffSeason () {
    return this._isOffSeason;
  }
};
