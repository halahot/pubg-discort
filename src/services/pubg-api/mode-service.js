const GameMode = require('../../pubg-js-api/shared/constants.js');

module.exports = class PubgModeService {
  static getAvailableModes () {
    return Object.values(GameMode);
  }
};
