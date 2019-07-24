import * as Discord from 'discord.js';


export default class DiscordMessageService {

    /**
     * Handles a command error and sends an error message.
     *
     * @param {Discord.Message} msg: Discord.Message
     * @param {string} errMessage: error string
     * @param {obj} help: command help object
     */
    static handleError(msg, errMessage, help) {
        let message = `${errMessage}\n`;
        if (help) {
            message += `\n== usage == \n${help.usage}\n\n= Examples =\n\n${help.examples.map(e => `${e}`).join('\n')}`;
        }
        msg.channel.send(message, { code: 'asciidoc' });
    }

    /**
     * Creates a base embed
     *
     * @returns {Discord.RichEmbed} a new RichEmbed with basic information
     */
    static createBaseEmbed(nickname, json, setTimeStamp = false, settings) {
        const embed = new Discord.RichEmbed();
        const title = `Профиль игрока ${nickname}:`;

        if (title) { embed.setTitle(title); }
        if(settings.avatar){embed.  setThumbnail(settings.avatar);}
        if(setTimeStamp) {embed.setTimestamp();}
        embed.setColor(0x00AE86);
        
        return embed;
    }

    static async setupReactions(msg, originalPoster, onOneCollect, onTwoCollect, onFourCollect) {
        const reaction_numbers = ["\u0030\u20E3", "\u0031\u20E3", "\u0032\u20E3", "\u0033\u20E3", "\u0034\u20E3", "\u0035\u20E3", "\u0036\u20E3", "\u0037\u20E3", "\u0038\u20E3", "\u0039\u20E3"]
        await msg.react(reaction_numbers[1]);
        await msg.react(reaction_numbers[2]);
        await msg.react(reaction_numbers[4]);

        const one_filter = (reaction, user) => reaction.emoji.name === reaction_numbers[1] && originalPoster.id === user.id;
        const two_filter = (reaction, user) => reaction.emoji.name === reaction_numbers[2] && originalPoster.id === user.id;
        const four_filter = (reaction, user) => reaction.emoji.name === reaction_numbers[4] && originalPoster.id === user.id;

        const one_collector = msg.createReactionCollector(one_filter, { time: 15 * 1000 });
        const two_collector = msg.createReactionCollector(two_filter, { time: 15 * 1000 });
        const four_collector = msg.createReactionCollector(four_filter, { time: 15 * 1000 });

        one_collector.on('collect', onOneCollect);
        two_collector.on('collect', onTwoCollect);
        four_collector.on('collect', onFourCollect);

        one_collector.on('end', () =>  { msg.clearReactions().catch(() => {}).then(() => { msg.edit('').catch(() => {}); }); });
        two_collector.on('end', () =>  { msg.clearReactions().catch(() => {}).then(() => { msg.edit('').catch(() => {}); }); });
        four_collector.on('end', () => { msg.clearReactions().catch(() => {}).then(() => { msg.edit('').catch(() => {}); }); });
    }

}