const Discord = require('discord.js');
const SqlServerRegisteryService = require('../../services/sql-servises/sql-serverRegistry-service.js');
const constants = require('../../shared/constants.js');
module.exports = class Users {
  constructor () {
    this.name = 'getUsers',
    this.alias = 'all',
    this.usage = 'all';
  }

  async run (msg) {
    const registeredPlayers = await SqlServerRegisteryService.getRegisteredPlayersForServer(msg.guild.id);
    const registeredPlayersStr = this.getPlayerString(registeredPlayers);

    const embed = new Discord.RichEmbed()
      .setTitle(registeredPlayers.length + ' зарегистрированных пользователей')
      .setColor(constants.COLOR)
      .addField('Игроки', registeredPlayersStr, true)
      .addBlankField(true);

    msg.channel.send({ embed });
  }

  getPlayerString (registeredPlayers) {
    let players = '';

    for (let i = 0; i < registeredPlayers.length; i++) {
      const player = registeredPlayers[i];
      players += `${i + 1}.\t **${player.username}** [${player.platform}]\n`;
    }

    if (players === '') {
      players = 'Нет зарегистрированных пользователей. Введите `<prefix>addUser <username>`';
    }

    return players;
  }
};
