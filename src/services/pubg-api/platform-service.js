const CommonService = require('../common-service.js');
const PubgAPI = require('../../pubg-js-api/api/base.js');

const apiKey = CommonService.getEnvironmentVariable('pubg_api_key');

module.exports = class PubgPlatformService {
  static getApi () {
    return new PubgAPI.PubgAPI(apiKey);
  } 
};
