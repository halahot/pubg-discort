const Discord = require('discord.js');
const DiscordMessageService = require('../../services/messages-services.js');
const PubgPlayerService = require('../../services/pubg-api.js');
const SqlServerRegisteryService = require('../../services/sql-servises/sql-serverRegistry-service.js');
const PubgPlatformService = require('../../services/pubg-api/');
const constants = require('../../shared/constants.js');
module.exports = class AddUser {
  constructor () {
    this.name = 'addUser',
    this.alias = 'add',
    this.usage = this.getHelp();
  }

  getHelp () {
    return {
      name: 'addUser',
      description: 'Добавляет пользователя на сервер. **Name is case sensitive**',
      usage: '<prefix>add <username>',
      examples: [
        '!addUser john',
        '!addUser "Player A"'
      ]
    };
  }

  async run (client, msg, args) {
    const userName = args[0];
    if (!userName) {
      DiscordMessageService.handleError(msg, 'Ошибка: Укажите имя пользователя', this.getHelp());
      return;
    }

    // const serverDefaults = await SqlServerService.getServer(msg.guild.id);
    const api = PubgPlatformService.getApi();
    this.addUser(msg, api, userName);
  }

  async addUser (msg, api, username) {
    const message = await msg.channel.send(`Проверка **${username}** PUBG Id ... подождите несколько секунд`);
    const pubgId = await PubgPlayerService.getPlayerId(api, username);

    if (!pubgId) {
      message.edit(`Пользователь **${username}** не найден. Проверьте имя пользователя.`);
      return;
    }

    const registered = await SqlServerRegisteryService.registerUserToServer(pubgId, message.guild.id);
    if (registered) {
      const registeredPlayers = await SqlServerRegisteryService.getRegisteredPlayersForServer(msg.guild.id);
      const registeredPlayersStr = this.getPlayerString(registeredPlayers);

      const embed = new Discord.RichEmbed()
        .setTitle(registeredPlayers.length + ' зарегистрированных игроков')
        .setColor(constants.COLOR)
        .addField('Игроки', registeredPlayersStr, true)
        .addBlankField(true);
      message.edit(`Добавлен **${username}**`, { embed });
    } else {
      message.edit(`Нельзя добавить **${username}**`);
    }
  }

  getPlayerString (registeredPlayers) {
    let players = '';

    for (let i = 0; i < registeredPlayers.length; i++) {
      const player = registeredPlayers[i];
      players += `${i + 1}.\t **${player.username}** [${player.platform}]\n`;
    }

    if (players === '') {
      players = 'Нет зарегистрированных пользователей. Используйте `<prefix>addUser <username>`';
    }

    return players;
  }
};
