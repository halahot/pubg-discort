require('dotenv').config();
const path = require('path');
const {
  CommandHandler
} = require('djs-commands');
const handler = new CommandHandler({
  folder: path.join(__dirname, '../src/commands/'),
  prefix: [process.env.prefix]
});
console.log(handler)
module.exports = (client, message) => {
  // Ignore all bots
  if (message.author.bot) return;
  // Ignore messages not starting with the prefix (in config.json)
  if (message.content.indexOf(client.config.prefix) !== 0) return;
  // If message to DM
  if (message.channel.type === 'dm') return;
  const args = message.content.split(' ');
  const command = args[0];

  if (handler.getCommand(command)) {
    try {
      handler.getCommand(command).run(client, message, args);
    } catch (error) {
      console.log(error);
    }
  }
};
