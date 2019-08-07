const seasonService = require('../src/services/pubg-api/season-service.js');
const PlayerService = require('../src/services/pubg-api/player-service.js');
const PubgPlayerService = require('../src/services/pubg-api/player-service.js');
const CommonService = require('../src/services/common-service.js');
const PubgPlatformService = require('../src/services/pubg-api/platform-service.js');
const assignRole = require('../src/services/role-service.js');

const fs = require('fs');
const { ROLES } = require('../src/shared/constants.js');
console.log(PlayerService);

var kds;
var Guild;
var currentSeason;

module.exports = client => {
  try {
    console.log(`Logged in as ${client.user.tag}!`);
    client.guilds.forEach(guild => {
      Guild = guild;
    });

    updateSeason();
    setInterval(updateSeason, 10800000);
    pubgUpdate();
    setInterval(pubgUpdate, 86400000);
  } catch (e) {
    console.log(e);
  }
};

async function updateSeason () {
  currentSeason = seasonService.getCurrentSeason();
  fs.writeFileSync('/temp/PUBGSeason', currentSeason);
  console.log(currentSeason);
}

async function pubgUpdate () {
  const players = PlayerService.getPlayers();
  const api = PubgPlatformService.getApi();
  await asyncForEach(players, async (player) => {
    const seasonData = await PubgPlayerService.getPlayerSeasonStatsById(api, player.pubg_id, currentSeason);
    kds = CommonService.round((seasonData._squadFPPStat.kills / seasonData._squadFPPStat.losses) * 10) / 10;
    await checkRoles(Guild.members.find(x => x.name === player.name));
  });
}

async function checkRoles (user) {
  try {
    user.roles.deleteAll();
    assignRole(user, kds, ROLES);
  } catch (e) {
    console.log(e);
  }
}

async function asyncForEach (array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
