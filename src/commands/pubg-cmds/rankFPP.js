import * as Discord from 'discord.js';
import { CommonService,
    DiscordMessageService,
    ParameterService,
    PubgPlatformService, PubgPlayerService, PubgRatingService,
    SqlServerService
} from '../../services';
import { PubgAPI, PlatformRegion, PlayerSeason, Player, GameModeStats, Season } from '../../pubg-js-api';
import { PubgSeasonService } from '../../services/pubg-api/season-service.js';

export default class Rank {

   getHelp() {
        return {
            name: 'fpp',
            description: `Возвращает fpp статистику игрока. **Имя чувствительно к регистру**`,
            usage: ['<prefix>fpp [pubg username]', 
                '<prefix> fpp'],
            examples: [
                '!fpp'
            ]
        };
    }

    async run(bot, msg, params, perms) {
        const originalPoster = msg.author;
        let paramMap;

        try {
            paramMap = await this.getParameters(msg, params);
        } catch (e) {
            return;
        }

        const checkingParametersMsg = (await msg.channel.send('Проверка параметров ...'));        

        const message = await checkingParametersMsg.edit(`Получение данных **${paramMap.username}**`);

        // const api = PubgPlatformService.getApi(PlatformRegion[this.paramMap.region]);
        const players = await PubgPlayerService.getPlayersByName(api, [paramMap.username]);

        if (players.length === 0) {
            message.edit(`Для **${this.paramMap.username}** не найдено статистики. Проверьте правильно ли введено имя.`);
            return;
        }
        const player = players[0];
        if (!player.id) {
            message.edit(`Для **${this.paramMap.username}** не найдено статистики. Проверьте правильно ли введено имя.`);
            return;
        }
        
        this.setupReactions(imageReply, originalPoster, seasonData);
    };

    /**
     * Retrieves the paramters for the command
     *
     */
    async getParameters(msg, params) {
        let paramMap;
        let pubg_params;

        if (msg.guild) {
            const serverDefaults = await SqlServerService.getServer(msg.guild.id);
            pubg_params = await ParameterService.getPubgParameters(params.join(' '), msg.author.id, true, serverDefaults);

        // Throw error if no username supplied
        if (!pubg_params.username) {
            DiscordMessageService.handleError(msg, 'Error:: Must specify a username or register with `register` command', this.getHelp());
            throw 'Укажите имя пользователя';
        }

        paramMap = {
            username: pubg_params.username,
        };
        
        return paramMap;
    }

    /**
     * Adds reaction collectors and filters to make interactive messages
   
     */
    async setupReactions(msg, originalPoster, seasonData) {
        const onOneCollect = async () => {
           
            const attatchment = await this.createImage(seasonData.soloFPPStats, seasonData.soloStats, 'Solo');

            if (msg.deletable) {
                await msg.delete().catch(() => { });
            }

            const newMsg = await msg.channel.send(`**${originalPoster.username}**, use the **1**, **2**, and **4** **reactions** to switch between **Solo**, **Duo**, and **Squad**.`, attatchment) as Discord.Message;
            this.setupReactions(newMsg, originalPoster, seasonData);
        };
        const onTwoCollect = async () => {
            AnalyticsService.track(`${this.help.name} - Click 2`, {
                pubg_name: this.paramMap.username,
                season: this.paramMap.season,
                region: this.paramMap.region,
                mode: this.paramMap.mode
            });

            const attatchment = await this.createImage(seasonData.duoFPPStats, seasonData.duoStats, 'Duo');

            if (msg.deletable) {
                await msg.delete().catch(() => { });
            }

            const newMsg = await msg.channel.send(`**${originalPoster.username}**, use the **1**, **2**, and **4** **reactions** to switch between **Solo**, **Duo**, and **Squad**.`, attatchment) as Discord.Message;
            this.setupReactions(newMsg, originalPoster, seasonData);
        };
        const onFourCollect = async () => {
            AnalyticsService.track(`${this.help.name} - Click 4`, {
                pubg_name: this.paramMap.username,
                season: this.paramMap.season,
                region: this.paramMap.region,
                mode: this.paramMap.mode
            });

            const attatchment = await this.createImage(seasonData.squadFPPStats, seasonData.squadStats, 'Squad');

            if (msg.deletable) {
                await msg.delete().catch(() => { });
            }

            const newMsg = await msg.channel.send(`**${originalPoster.username}**, use the **1**, **2**, and **4** **reactions** to switch between **Solo**, **Duo**, and **Squad**.`, attatchment) as Discord.Message;
            this.setupReactions(newMsg, originalPoster, seasonData);
        };
        DiscordMessageService.setupReactions(msg, originalPoster, onOneCollect, onTwoCollect, onFourCollect);
    }    

    //////////////////////////////////////
    // Image
    //////////////////////////////////////

    private async createImage(fppStats: GameModeStats, tppStats: GameModeStats, mode: string): Promise<Discord.Attachment> {
        let baseHeaderImg: Jimp = await ImageService.loadImage(ImageLocation.BLACK_1050_130);
        let baseImg: Jimp = await ImageService.loadImage(ImageLocation.RANK_BODY);

        const baseImageWidth = baseImg.getWidth();
        const baseImageHeight = baseImg.getHeight();

        // Create parts of final image
        const headerImg: Jimp = await this.addHeaderImageText(baseHeaderImg.clone());
        let fppStatsImage: Jimp;
        let tppStatsImage: Jimp;
        if (fppStats.roundsPlayed > 0) {
            fppStatsImage = await this.addBodyTextToImage(baseImg.clone(), fppStats, `${mode} FPP`);
        }
        if (tppStats.roundsPlayed > 0) {
            tppStatsImage = await this.addBodyTextToImage(baseImg.clone(), tppStats, `${mode}`);
        }

        // Merge parts together
        let image: Jimp = headerImg.clone();
        let heightTally = image.getHeight();
        if (fppStatsImage) {
            const newHeight = heightTally + baseImageHeight;
            let newCanvas = new Jimp(baseImageWidth, newHeight);
            newCanvas.composite(image, 0, 0);

            image = newCanvas.composite(fppStatsImage, 0, heightTally);
            heightTally = image.getHeight();
        }
        if (tppStatsImage) {
            const newHeight = heightTally + baseImageHeight;
            let newCanvas = new Jimp(baseImageWidth, newHeight);
            newCanvas.composite(image, 0, 0);

            image = newCanvas.composite(tppStatsImage, 0, heightTally);
            heightTally = image.getHeight();
        }

        // Create/Merge error message
        if (!fppStatsImage && !tppStatsImage) {
            const errMessageImage: Jimp = await this.addNoMatchesPlayedText(baseHeaderImg.clone(), mode);
            image = ImageService.combineImagesVertically(image, errMessageImage);
        }

        const imageBuffer: Buffer = await image.getBufferAsync(Jimp.MIME_PNG);
        return new Discord.Attachment(imageBuffer);
    }

    async addNoMatchesPlayedText(mode) {
        return `Player hasn\'t played "${mode}" games this season`;
    }

    MIDDLE
}
const font_48_white: Jimp.Font = await ImageService.loadFont(FontLocation.TEKO_REGULAR_WHITE_48);
const font_48_orange: Jimp.Font = await ImageService.loadFont(FontLocation.TEKO_BOLD_ORANGE_40);
let textWidth: number;

const body_subheading_x: number = 50;
const body_subheading_y: number = 5;
const body_top_y: number = 95;
const body_mid_y: number = 245;
const body_bottom_y: number = 395;

const platform: PlatformRegion = PlatformRegion[this.paramMap.region];

let overallRating;
let rankTitle;

const isOldSeason: boolean = PubgSeasonService.isOldSeason(platform, this.paramMap.season);
if (isOldSeason) {
    overallRating = CommonService.round(PubgRatingService.calculateOverallRating(stats.winPoints, stats.killPoints), 0) || 'NA';
} else if (PubgPlatformService.isPlatformPC(platform) && this.paramMap.season === 'pc-2018-01') {
    overallRating = CommonService.round(stats.rankPoints, 0) || 'NA';
    badge = (await ImageService.loadImage(PubgRatingService.getRankBadgeImageFromRanking(stats.rankPoints))).clone();
    rankTitle = PubgRatingService.getRankTitleFromRanking(stats.rankPoints);
} else if (this.paramMap.season === 'lifetime') {
    overallRating = 'NA';
} else {
    overallRating = CommonService.round(stats.rankPoints, 0) || 'NA';
    badge = (await ImageService.loadImage(PubgRatingService.getSurvivalTitleBadgeImage(stats.rankPointsTitle))).clone();
    rankTitle = PubgRatingService.getSurivivalTitle(stats.rankPointsTitle);
}

const kd = CommonService.round(stats.kills / stats.losses) || 0;
const kda = CommonService.round((stats.kills + stats.assists) / stats.losses) || 0;
const winPercent = CommonService.getPercentFromFraction(stats.wins, stats.roundsPlayed);
const topTenPercent = CommonService.getPercentFromFraction(stats.top10s, stats.roundsPlayed);
const averageDamageDealt = CommonService.round(stats.damageDealt / stats.roundsPlayed) || 0;

let x_centers = {
    kd: 174,
    winPercent: 404,
    topTenPercent: 645.5,
    averageDamageDealt: 881,
    kda: 171.5,
    kills: 407.5,
    assists: 644,
    dBNOs: 882.5,
    longestKill: 287.5,
    headshotKills: 762.6
}

// Sub Heading
textObj.text = `${mode} - ${overallRating}`;
textWidth = Jimp.measureText(font_48_white, textObj.text);
img.print(font_48_white, body_subheading_x + 10, body_subheading_y, textObj);

if (badge) {
    img.composite(badge, 525 - (badge.getWidth() / 2), 380);
    textObj.text = rankTitle;
    textWidth = Jimp.measureText(font_48_orange, textObj.text);
    img.print(font_48_orange, 525 - (textWidth / 2), 360, textObj);
}

textObj.text = `${stats.wins}`;
textWidth = Jimp.measureText(font_48_white, textObj.text);
img.print(font_48_white, 510 - textWidth, body_subheading_y, textObj);

textObj.text = `${stats.top10s}`;
textWidth = Jimp.measureText(font_48_white, textObj.text);
img.print(font_48_white, 685 - textWidth, body_subheading_y, textObj);

textObj.text = `${stats.roundsPlayed}`;
textWidth = Jimp.measureText(font_48_white, textObj.text);
img.print(font_48_white, imageWidth - textWidth - 180, body_subheading_y, textObj);

// Body - Top
textObj.text = `${kd}`;
textWidth = Jimp.measureText(font_48_orange, textObj.text);
img.print(font_48_orange, x_centers.kd - (textWidth / 2), body_top_y, textObj);

textObj.text = `${winPercent}`;
textWidth = Jimp.measureText(font_48_orange, textObj.text);
img.print(font_48_orange, x_centers.winPercent - (textWidth / 2), body_top_y, textObj);

textObj.text = `${topTenPercent}`;
textWidth = Jimp.measureText(font_48_orange, textObj.text);
img.print(font_48_orange, x_centers.topTenPercent - (textWidth / 2), body_top_y, textObj);

textObj.text = `${averageDamageDealt}`;;
textWidth = Jimp.measureText(font_48_orange, textObj.text);
img.print(font_48_orange, x_centers.averageDamageDealt - (textWidth / 2), body_top_y, textObj);

// Body - Middle
textObj.text = `${kda}`;
textWidth = Jimp.measureText(font_48_orange, textObj.text);
img.print(font_48_orange, x_centers.kda - (textWidth / 2), body_mid_y, textObj);

textObj.text = `${stats.kills}`;
textWidth = Jimp.measureText(font_48_orange, textObj.text);
img.print(font_48_orange, x_centers.kills - (textWidth / 2), body_mid_y, textObj);

textObj.text = `${stats.assists}`;
textWidth = Jimp.measureText(font_48_orange, textObj.text);
img.print(font_48_orange, x_centers.assists - (textWidth / 2), body_mid_y, textObj);

textObj.text = `${stats.dBNOs}`;
textWidth = Jimp.measureText(font_48_orange, textObj.text);
img.print(font_48_orange, x_centers.dBNOs - (textWidth / 2), body_mid_y, textObj);

// Body - Bottom
textObj.text = `${stats.longestKill.toFixed(2)}m`;
textWidth = Jimp.measureText(font_48_orange, textObj.text);
img.print(font_48_orange, x_centers.longestKill - (textWidth / 2), body_bottom_y, textObj);

textObj.text = `${stats.headshotKills}`;
textWidth = Jimp.measureText(font_48_orange, textObj.text);
img.print(font_48_orange, x_centers.headshotKills - (textWidth / 2), body_bottom_y, textObj);

return img;
    }
}