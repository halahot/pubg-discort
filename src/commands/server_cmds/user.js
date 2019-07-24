import * as Discord from 'discord.js';
import { SqlServerRegisteryService } from '../../services';
import { COLOR } from '../../shared/constants';

export class Users {

    /* conf: CommandConfiguration = {
        group: 'Server',
        enabled: true,
        guildOnly: true,
        aliases: [],
        permLevel: 0
    }; */

    /* help = {
        name: 'users',
        description: 'List all users on the server\'s registery.',
        usage: '<prefix>users',
        examples: [
            '!users'
        ]
    }; */

    async run(msg) {

        const registeredPlayers = await SqlServerRegisteryService.getRegisteredPlayersForServer(msg.guild.id);
        const registeredPlayersStr = this.getPlayerString(registeredPlayers);

        let embed = new Discord.RichEmbed()
            .setTitle(registeredPlayers.length + ' зарегистрированных пользователей')
            .setColor(COLOR)
            .addField('Игроки', registeredPlayersStr, true)
            .addBlankField(true);

        msg.channel.send({ embed });
    };

    getPlayerString(registeredPlayers) {
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

}