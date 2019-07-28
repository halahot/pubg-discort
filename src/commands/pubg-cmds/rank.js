import { PubgAPI, PlayerSeason, Player, GameModeStats, Season } from '../../pubg-js-api';
const constants = require('../../shared/constants.js');
const Discord = require('discord.js');
const fs = require('fs');
const CommonService = require('../../services/common-service.js');
const DiscordMessageService = require('../../services/messages-services.js');
const ParameterService = require('../../services/parametr-service');
const PubgPlatformService = require('../../services/pubg-api/platform-service.js');
const PubgPlayerService = require('../../services/pubg-api/player-service.js');
// const PubgRatingService = require('../../services/pubg-api/')
const SqlServerService = require('../../services/sql-servises/sql-server-service.js');
const PubgSeasonService = require('../../services/pubg-api/season-service.js');

const scopeChannelCategory = '578324527319220239';
const scopeTextChannel = '578324469508997120';
const currSeason = fs.readFileSync('temp/PUBGseason');

let mode;
let kds;
module.exports = class Rank {
  getHelp () {
    return {
      name: 'tpp, fpp',
      description: `Возвращает статистику игрока. **Имя чувствительно к регистру**`,
      usage: ['<prefix>tpp [pubg username]', '<prefix>fpp [pubg username]',
        '<prefix> tpp',
        '<prefix> fpp'],
      examples: [
        '!tpp',
        '!fpp'
      ]
    };
  }

  async run (bot, msg, params, Guild) {
    let userName = msg.author.username;

    try {
      bot.guilds.forEach(guild => {
        Guild = guild;
      });
      await this.checkRoles(Guild.members.find(x => x.id === msg.author.id));

      mode = params.slice(0, 1)[0];
      if (params[1]) {
        userName = params.slice(1, 2)[0];
      }
    } catch (e) {
      console.log(e);
      return;
    }

    const checkingParametersMsg = (await msg.channel.send('Проверка параметров ...'));

    const message = await checkingParametersMsg.edit(`Получение данных **${userName}**`);
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
      .setColor(constants.COLOR)
      .setThumbnail(player.avatar);
    await this.createFields(seasonData, embed);
    return embed;
  }

  async rankGen (old) {
    old = old.split('-');
    if (old.length == 2) return ranks[old[0]] + ' ' + romeNum[old[1]];
    return `${ranks[old[0]]}`;
  }

  async createFields (seasonData, embed) {
    let stat = [seasonData._soloStat, seasonData._duoStat, seasonData._squadStat];
    let statFPP = [seasonData._soloFPPStat, seasonData._duoFPPStat, seasonData._squadFPPStat];
    const modes = ['solo', 'duo', 'squad'];
    await this.asyncForEach([0, 1, 2], async (item) => {
      let currentMode = modes[item];
      if (mode === 'fpp') {
        if (item === 2 && mode === 'fpp') {
            kds = CommonService.round((modeStats.kills / modeStats.losses) * 10) / 10;
          }
        this.addGameModeStats(modes, statFPP[item], embed);  
      }     
      this.addGameModeStats(modes, stat[item], embed);
    }); 
  }

  addGameModeStats (modes, modeStats, embed) {
    try {
        embed.addField(`**${modes[item].toUpperCase()}**`, `Ранг: **${CommonService.round(modeStats.rankPoints)} [${await rankGen(modeStats.rankPointsTitle)}]**
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

  async checkRoles (user) {
    let temp = 0;
    try {
      await asyncForEach(Roles, async (role) => {
        if (kds >= role.kd) temp++;
        const rolet = user.roles.find(x => x.id == role.roleID);
        if (rolet != null) {
          await user.removeRole(rolet.id);
        };
      });
      if (temp != 0) await user.addRole(Roles[temp - 1].roleID);
    } catch (e) {
      av = true;
      console.log(e);
    }
  }
};
