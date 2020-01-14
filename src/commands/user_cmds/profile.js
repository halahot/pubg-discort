const Discord = require('discord.js');
const SqlUserRegisteryService = require('../../services/sql-servises/sql-user-registry-service.js');
const constants = require('../../shared/constants.js');

module.exports = class Profile {
  constructor () {
    this.name = 'profile',
    this.alias = ['profile'],
    this.usage = 'profile';
  }

  // todo: what is mention
  async run (client, msg, params) {
    let discordId;
    let usedMention = false;

    let user;
    if (params.length > 0) {
      const mention = params[0];
      discordId = mention.substring(2, mention.length - 1);
      usedMention = true;
      if (usedMention && !msg.guild) {
        msg.channel.send(`Mentions are not supported in direct messages.`);
        return;
      }
      try {
        user = await client.fetchUser(discordId);
      } catch (e) {
        msg.channel.send(`You must use a Discord Mention as a parameter.`);
        return;
      }
    } else {
      discordId = msg.author.id;
      user = msg.author;
    }

    const player = await SqlUserRegisteryService.getRegisteredUser(discordId);

    if (!player && !player.username && !usedMention) {
      msg.channel.send(`Вы пока не зарегистрированы -- введите команду \`reg\`.`);
      return;
    } else if (!player && !player.username && usedMention) {
      msg.channel.send(`Пользователь не зарегистрирован -- введите команду  \`reg\`.`);
      return;
    }

    const date = user.createdAt;
    const embed = new Discord.RichEmbed()
      .setTitle(`Профиль **${user.tag}**`)
      .setThumbnail(user.displayAvatarURL)
      .setColor(constants.COLOR)
      .addField('Зарегистрирован Discord', `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`)
      .addField('PUBG Username', player.username, true)
      .addField('Platform', player.platform, true)
      .setTimestamp();

    msg.channel.send({ embed });
  }
};
