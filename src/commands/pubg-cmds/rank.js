const { LOG_CHANNEL_ID,
  ROLES,
  COLOR } = require('../../shared/constants.js');
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const CommonService = require('../../services/common-service.js');
const PubgPlatformService = require('../../services/pubg-api/platform-service.js');
const PubgPlayerService = require('../../services/pubg-api/player-service.js');
const assignRole = require('../../services/role-service.js');
// const PubgRatingService = require('../../services/pubg-api/')
const currSeason = fs.readFileSync(path.join(__dirname, '../../temp/PUBGSeason'));

let mode;
let kds;
let user;
module.exports = class Rank {
  constructor () {
    this.name = 'getStats',
    this.alias = ['tpp', 'fpp'],
    this.usage = '';
  }

  async run (client, message, args) {
    let userName = message.author.username;

    const logChannel = message.channels.find(x => x.id === LOG_CHANNEL_ID);
    // const userChannel = msg.channels.find(x => x.id === USER_CHANNEL_ID);
    user = client.users.find(x => x.id === message.author.id);
    mode = args.slice(0, 1)[0];

    if (args[1]) {
      userName = args.slice(1, 2)[0];
    }

    const checkingParametersMsg = (await logChannel.send('Проверка параметров ...'));

    await checkingParametersMsg.edit(`Получение данных **${userName}**`);
    const api = PubgPlatformService.getApi();
    const players = await PubgPlayerService.getPlayersByName(api, userName);

    if (players.length === 0) {
      message.edit(`Для **${userName}** не найдено статистики. Проверьте правильно ли введено имя или команда.`);
      return;
    }
    const player = players[0];
    if (!player.id) {
      message.edit(`Для **${userName}** не найдено статистики. Проверьте правильно ли введено имя или команда.`);
      return;
    }

    const seasonData = await PubgPlayerService.getPlayerSeasonStatsById(api, player.id, currSeason);

    this.setupReactions(message, player, seasonData);
  }

  /**
     * Adds reaction collectors and filters to make interactive messages

     */
  async setupReactions (msg, player, seasonData) {
    try {
      const embed = await this.getEmbed(msg.author.nickname, seasonData, player);
      await msg.delete();
      await msg.channel.send({
        embed
      });
    } catch (e) {
      console.log(e);
    }
  }

  async asyncForEach (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  async getEmbed (nickname, seasonData, player) {
    var embed = new Discord.RichEmbed()
      .setTitle(`Профиль игрока ${nickname}:`)
      .setColor(COLOR)
      .setThumbnail(player.avatar);
    await this.createFields(seasonData, embed);
    await assignRole(user, kds, ROLES);

    return embed;
  }

  async createFields (seasonData, embed) {
    let stat;

    if (mode === 'tpp') {
      stat = [seasonData._soloStat, seasonData._duoStat, seasonData._squadStat];
    }
    if (mode === 'fpp') {
      stat = [seasonData._soloFPPStat, seasonData._duoFPPStat, seasonData._squadFPPStat];
    }
    await this.asyncForEach([0, 1, 2], async (item) => {
      if (item === 2 && mode === 'fpp') {
        kds = CommonService.round((stat[item].kills / stat[item].losses) * 10) / 10;
      }
      this.addGameModeStats(stat[item], embed);
    });
  }

  addGameModeStats (modeStats, embed) {
    try {
      embed.addField(`**${modeStats.toUpperCase()}**
                Сыгранно матчей: **${modeStats.roundsPlayed}**
                K/D: **${CommonService.round((modeStats.kills / modeStats.losses) * 10) / 10}**
                Средний урон: **${CommonService.round((modeStats.damageDealt / modeStats.roundsPlayed) * 10) / 10}**
                Максимум киллов: **${modeStats.maxKillStreaks}**
                Самый длинный килл: **${CommonService.round(modeStats.longestKill)}m**
                `, true);
    } catch (e) {
      console.log(e);
    }
  }
};
