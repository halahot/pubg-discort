import * as Discord from 'discord.js';
import { DiscordMessageService } from '../../services/messages-services.js';
import { ParameterService } from '../../services/parametr-service.js';
import { PubgPlayerService } from '../../services/pubg-api.js';
import { SqlServerService } from '../../services/sql-servises/sql-server-service.js';
import { SqlServerRegisteryService } from '../../services/sql-servises/sql-serverRegistry-service.js';
import { PubgPlatformService } from '../../services/pubg-api/';
import { COLOR } from '../../shared/constants.js';

export class AddUser {

    /* conf: CommandConfiguration = {
        group: 'Server',
        enabled: true,
        guildOnly: true,
        aliases: [],
        permLevel: 0
    }; */

    getHelp() {
        return {
            name: 'addUser',
            description: 'Добавляет пользователя на сервер. **Name is case sensitive**',
            usage: '<prefix>addUser <username>',
            examples: [
                '!addUser john',
                '!addUser "Player A"',
            ]
        };
    }

    async run(bot, msg, params, perms) {
        if (!params[0]) {
            DiscordMessageService.handleError(msg, 'Ошибка: Укажите имя пользователя', this.getHelp());
            return;
        }

        const serverDefaults = await SqlServerService.getServer(msg.guild.id);
        const pubg_params = await ParameterService.getPubgParameters(params.join(' '), msg.author.id, true, serverDefaults);
        const api = PubgPlatformService.getApi();

       /*  AnalyticsService.track(this.help.name, {
            distinct_id: msg.author.id,
            server_id: msg.guild.id,
            discord_id: msg.author.id,
            discord_username: msg.author.tag,
            number_parameters: params.length,
            pubg_name: pubg_params.username,
            region: pubg_params.region
        }); */

        this.addUser(msg, api, pubg_params.region, pubg_params.username);
    }

    async addUser(msg, api, region, username) {
        const message = await msg.channel.send(`Checking for **${username}**'s PUBG Id ... give me a second`);
        const pubgId = await PubgPlayerService.getPlayerId(api, username);

        if (!pubgId) {
            message.edit(`Could not find **${username}** on the **${region}** region. Double check the username and region.`);
            return;
        }

        const registered = await SqlServerRegisteryService.registerUserToServer(pubgId, message.guild.id);
        if (registered) {
            const registeredPlayers = await SqlServerRegisteryService.getRegisteredPlayersForServer(msg.guild.id);
            const registeredPlayersStr = this.getPlayerString(registeredPlayers);

            const embed = new Discord.RichEmbed()
                .setTitle(registeredPlayers.length + ' Registered Users')
                .setColor(COLOR)
                .addField('Players', registeredPlayersStr, true)
                .addBlankField(true);
            message.edit(`Добавлен **${username}**`, { embed });
        } else {
            message.edit(`Нельзя добавить **${username}**`);
        }
    }

    getPlayerString(registeredPlayers) {
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

}