const Discord = require('discord.js');
const DiscordMessageService = require('../../services/messages-services.js');
const PubgPlayerService = require('../../services/pubg-api/player-service.js');
const SqlServerService = require('../../services/sql-servises/sql-server-service.js');
const SqlUserRegisteryService = require('../../services/sql-servises/sql-user-registry-service.js');
const ParameterService = require('../../services/parametr-service.js');
const PubgPlatformService = require('../../services/pubg-api/platform-service.js');
const constants = require('../../shared/constants.js');
module.exports = class Register {
  getHelp () {
    return {
      name: 'reg',
      description: 'Регистрация пользователя Discord - **Имя чувствительно к регистру**',
      usage: '<префикс>reg <Имя пользователя>',
      examples: [
        '!reg john',
        '!reg "Player A"'
      ]
    };
  }

  async run (msg, params) {
    let paramMap;

    try {
      paramMap = await this.getParameters(msg, params);
    } catch (e) {
      return;
    }

    this.registerUser(msg, paramMap.username);
  }

  async getParameters (msg, params) {
    let paramMap;

    let pubg_params;
    if (msg.guild) {
      const serverDefaults = await SqlServerService.getServer(msg.guild.id);
      pubg_params = await ParameterService.getPubgParameters(params.join(' '), msg.author.id, true, serverDefaults);
    } else {
      pubg_params = await ParameterService.getPubgParameters(params.join(' '), msg.author.id, true);
    }

    // Throw error if no username supplied
    if (!pubg_params.username) {
      DiscordMessageService.handleError(msg, 'Нужно указать имя', this.getHelp);
      throw 'Ошибка: Нужно указать имя';
    }

    paramMap = {
      username: pubg_params.username,
      region: pubg_params.region.toUpperCase().replace('-', '_')
    };

    return paramMap;
  }

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
