const COMMON_MESSAGES = Object.freeze({
  REACTION_WARNING: ':warning: Bot is missing the `Text Permissions > Manage Messages` permission. Give permission for the best experience. :warning:'
});

const TIME_IN_SECONDS = Object.freeze({
  ONE_MINUTE: 60,
  FIVE_MINUTES: 300,
  ONE_HOUR: 18000
});

const COLOR = '0x00AE86';
const LOG_CHANNEL_ID = 608983185447190558;
const USER_CHANNEL_ID = 579821131595382816;

const ROLES =
    [{
      roleID: '579821131595382816',
      kd: '1'
    }, {
      roleID: '579821189501812748',
      kd: '1.5'
    }, {
      roleID: '579821228932464680',
      kd: '2'
    }, {
      roleID: '579821253355896833',
      kd: '2.5'
    }];

module.exports = {
  COMMON_MESSAGES,
  TIME_IN_SECONDS,
  COLOR,
  ROLES,
  LOG_CHANNEL_ID,
  USER_CHANNEL_ID
};
