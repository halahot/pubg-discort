import * as Discord from 'discord.js';
import {
    DiscordMessageService,
    PubgPlayerService,
    SqlServerService,
    SqlUserRegisteryService,
    ParameterService,
    PubgPlatformService,
} from '../../services';

import { COLOR } from '../../shared/constants.js';




export class Register {

    /* conf: CommandConfiguration = {
        group: 'User',
        enabled: true,
        guildOnly: false,
        aliases: [],
        permLevel: 0
    }; */

    getHelp() {

        return {
            name: 'register',
            description: 'Регистрация пользователя Discord - **Имя чувствительно к регистру**',
            usage: '<префикс>register <Имя пользователя>',
            examples: [
                '!register john',
                '!register "Player A"'
            ]
        };
    }

    async run(msg, params) {

        let paramMap;

        try {
            paramMap = await this.getParameters(msg, params);
        } catch (e) {
            return;
        }

        /* AnalyticsService.track(this.help.name, {
            distinct_id: msg.author.id,
            discord_id: msg.author.id,
            discord_username: msg.author.tag,
            pubg_name: this.paramMap.username,
            region: this.paramMap.region
        }); */

        this.registerUser(msg, paramMap.username);
    }

    async getParameters(msg, params) {
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
            region: pubg_params.region.toUpperCase().replace('-', '_'),
        };

        /* AnalyticsService.track(this.help.name, {
            distinct_id: msg.author.id,
            discord_id: msg.author.id,
            discord_username: msg.author.tag,
            number_parameters: params.length,
            pubg_name: paramMap.username,
            region: paramMap.region,
        }); */

        return paramMap;
    }

    async registerUser(msg, username) {
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
                .setColor(COLOR)
                .addField('Присоединился к Discord', `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`)
                .addField('PUBG Username', player.username, true)
                .addField('Platform', player.platform, true)
                .setTimestamp();

            message.edit({ embed });
        } else {
            message.edit(`Ошибка регистрации пользователя с PUBG Id **${username}**`);
        }
    }

}