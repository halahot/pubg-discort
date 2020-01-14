module.exports = class Kick {
  constructor () {
    this.name = 'kick',
    this.alias = ['kick'],
    this.usage = 'kick';
  }

  run (client, message, args) {
    const member = message.mentions.members.first();

    if (!member) {
      return message.reply(`Who are you trying to kick? You must mention a user.`);
    }

    if (!member.kickable) {
      return message.reply(`I can't kick this user. Sorry!`);
    }

    return member
      .kick()
      .then(() => message.reply(`${member.user.tag} was kicked.`))
      .catch(_error => message.reply(`Sorry, an error occured.`));
  }
};
