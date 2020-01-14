const Discord = require('discord.js');
const PubgPlayerService = require('../../services/pubg-api/player-service.js');
// const SqlServerService = require('../../services/sql-servises/sql-server-service.js');
const SqlUserRegisteryService = require('../../services/sql-servises/sql-user-registry-service.js');
const PubgPlatformService = require('../../services/pubg-api/platform-service.js');
const constants = require('../../shared/constants.js');
const assignRole = require('../../services/role-service.js');
module.exports = class Register {
  constructor () {
    this.name = 'reg',
    this.alias = ['reg'],
    this.usage = 'reg';
  }

  run (client, msg, args) {
    let username;

    try {
      username = args[0].slice(1);
    } catch (e) {
      return;
    }

    this.registerUser(msg, username);
  }

  // async getParameters (client, msg, params) {
  /*  let paramMap;

    let pubg_params;

    // Throw error if no username supplied
    if (!pubg_params.username) {
      msg.send(msg, 'Нужно указать имя');
    }

    paramMap = {
      username: pubg_params.username,
      region: pubg_params.region.toUpperCase().replace('-', '_')
    };

    return paramMap;
  } */

  async registerUser (msg, username) {
    const api = PubgPlatformService.getApi();
    const message = await msg.channel.send(`Проверям PUBG Id **${username}**  ... подождите несколько секунд`);
    const pubgId = await PubgPlayerService.getPlayerId(api, username);

    if (!pubgId) {
      message.edit(`Пользователь **${username}** не найден. Проверьте корректно ли введено имя пользователя.`);
      return;
    }

    const registered = await SqlUserRegisteryService.registerUser(msg.author.id, pubgId);
    if (registered) {
      const player = await SqlUserRegisteryService.getRegisteredUser(msg.author.id);

      const user = msg.author;
      const date = user.createdAt;
      const embed = new Discord.RichEmbed()
        .setTitle(`Профиль **${user.tag}**'`)
        .setThumbnail(user.displayAvatarURL)
        .setColor(constants.COLOR)
        .addField('Присоединился к Discord', `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`)
        .addField('PUBG Username', player.username, true)
        .addField('Platform', player.platform, true)
        .setTimestamp();

      message.edit({ embed });
    } else {
      message.edit(`Ошибка регистрации пользователя с PUBG Id **${username}**`);
    }
  }
};
