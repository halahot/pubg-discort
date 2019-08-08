const seasonService = require('../src/services/pubg-api/season-service.js');
const PlayerService = require('../src/services/pubg-api/player-service.js');
const PubgPlayerService = require('../src/services/pubg-api/player-service.js');
const CommonService = require('../src/services/common-service.js');
const PubgPlatformService = require('../src/services/pubg-api/platform-service.js');
const assignRole = require('../src/services/role-service.js');

const fs = require('fs');
const path = require('path');
const { ROLES } = require('../src/shared/constants.js');
console.log(PlayerService);

let kds;
let Guild;
let currentSeason;
const PATH_SEASON = path.join(__dirname, '../src/temp/PUBGSeason')
const api = PubgPlatformService.getApi();

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
  currentSeason = seasonService.getCurrentSeason(api);
  fs.writeFileSync(PATH_SEASON, currentSeason);
  console.log(currentSeason);
}

async function pubgUpdate () {
  const players = PlayerService.getPlayers();
  
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
