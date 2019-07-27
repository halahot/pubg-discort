import * as Discord from 'discord.js';
import { SqlUserRegisteryService } from '../../services';
import { COLOR } from '../../shared/constants.js';

export class Profile {

    /* conf: CommandConfiguration = {
        group: 'User',
        enabled: true,
        guildOnly: false,
        aliases: [],
        permLevel: 0
    }; */

    getHelp() {
        return {
            name: 'profile',
            description: `Показывает профиль Discord  пользователя`,
            usage: '<prefix>profile',
            examples: [
                '!profile',
                '!profile [@Discord_Mention]'
            ]
        };
    }

    async run(bot, msg, params, perms) {
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
                user = await bot.fetchUser(discordId);
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
            msg.channel.send(`You haven't registered yet -- run \`register\`.`);
            return;
        } else if (!player && !player.username && usedMention) {
            msg.channel.send(`Пользователь не зарегистрирован -- ask them run \`register\`.`);
            return;
        }

        /* AnalyticsService.track(this.help.name, {
            distinct_id: msg.author.id,
            discord_id: msg.author.id,
            discord_username: msg.author.tag,
            pubg_name: player.username
        }); */

        const date = user.createdAt;
        let embed = new Discord.RichEmbed()
            .setTitle(`Профиль **${user.tag}**`)
            .setThumbnail(user.displayAvatarURL)
            .setColor(COLOR)
            .addField('Зарегистрирован Discord', `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`)
            .addField('PUBG Username', player.username, true)
            .addField('Platform', player.platform, true)
            .setTimestamp();

        msg.channel.send({ embed });
    }

}