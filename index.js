const Discord = require('discord.js');
const client = new Discord.Client();
const path = require('path');
const {
  CommandHandler
} = require('djs-commands');
const handler = new CommandHandler({
  folder: path.join(__dirname, '/src/commands/'),
  prefix: ['.']
});

const fs = require('fs');
const constants = require('./src/shared/constants.js');
const CommonService = require('./src/services/common-service.js');
const seasonService = require('./src/services/pubg-api/season-service.js');
const SqlServerService = require('./src/services/sql-servises/sql-server-service.js');
const logger = require('./configs/logger-config.js');

const request = require('request');
const cheerio = require('cheerio');
const JSONbig = require('json-bigint');

const scopeChannelCategory = '578324527319220239';
// const PUBGnewsChannel = '576426394729447442'
const logChannel = '576426394729447442';
const unactivetime = 300000; // Период востановления слотов голосового канала
const newsCheckRate = 3600000; // Частота проверки на наличие новых новостей.
const lifeDuration = 30000; // Время, через которое роль удалится в мс.
const updateRate = 10000; // Время, через которое начинается проверка в мс (Можешь поставить несколько часов, операция не очень ресурсозатратная.).

const rp = require('request-promise');
const PATH = 'temp/DataBase';
// const pubgRoles = 'temp/pubgRoles';
// const Roles = JSONbig.parse(fs.readFileSync(pubgRoles));

var currSeason;
var checkBool = true;
var kds;
var json = [];

var Guild;
client.on('ready', async () => { // jshint ignore:line
  try {
    console.log(`Logged in as ${client.user.tag}!`);
    client.guilds.forEach(guild => {
      Guild = guild;
    });
    rolesCheck();
    setInterval(rolesCheck, updateRate);
    checkChannels();
    setInterval(checkChannels, 30000);
    await currentSeason();
    pubgUpdate();
    setInterval(pubgUpdate, 86400000);
  } catch (e) {
    console.log(e);
  }
});

client.on('error', (e) => {
  console.log(e);
});

client.on('message', (message) => {
  if (message.author.type !== 'bot' && message.channel.type !== 'dm') {
    // eslint-disable-next-line no-undef
    if (handler.getCommand(args[0])) {
      const args = message.content.split(' ');
      try {
        handler.getCommand(args[0]).run(client, message, Guild, args);
      } catch (error) {
        console.log(error);
      }
    }
  }
});

client.on('disconnect', () => {
  console.log('BOT DISCONNECTED!');
});

function checkChannels () {
  Guild.channels.forEach((channel) => {
    if (channel.parentID != undefined) {
      if (channel.parentID == scopeChannelCategory && channel.type == 'voice') {
        if (channel.members.size != channel.userLimit && channel.members.size != 1 && channel.userLimit != 4) {
          channel.setUserLimit(4);
        }
      }
    }
  });
  fs.writeFileSync('temp/reSize', '[]');
}

/* todo: новости
function getNews() {
    try {
        PUBGgetNews();
    } catch (e) {
        console.log(e);
    }
} */

function rolesCheck () {
  const Timeouts = JSONbig.parse(fs.readFileSync('Timeouts.json', encoding = 'utf-8', function (error, data) {
    if (error) throw error;
  }));
  try {
    for (let v = 0; v < Timeouts.length; v++) {
      if (Timeouts[v] != undefined && Guild.members.find(x => x.id == Timeouts[v].userId.toString())) {
        const user = Guild.members.find(x => x.id == Timeouts[v].userId.toString());
        console.log(Timeouts[v].time + (lifeDuration / 1000) + ' <= ' + Math.round(Math.round(new Date().getTime()) / 1000));
        if (Timeouts[v].time + (lifeDuration / 1000) <= Math.round(Math.round(new Date().getTime()) / 1000)) {
          try {
            if (user.roles.find(r => r.id == Timeouts[v].roleId.toString())) {
              user.removeRole(Timeouts[v].roleId.toString());
              console.log(`У ${user.displayName} [${user.id}] кончилась подписка на роль ${Guild.roles.find(x => x.id == Timeouts[v].roleId.toString()).name} на сервере #{Guild.name}`);
            }
          } catch (err) {
            console.log(err + '\n' + 'Guild member not found or them don`t have role, that you want to delete!');
            return;
          }

          user.send(`${user}, Ваша роль ${Guild.roles.find(x => x.id == Timeouts[v].roleId.toString()).name} на сервере ${Guild.name} просрочена!`);
          Guild.channels.find(x => x.id == logChannel).send(`Роль ${Guild.roles.find(x => x.id == Timeouts[v].roleId.toString())} пользователя ${user} просрочена!`);
          delete Timeouts[v];
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
  fs.writeFileSync('Timeouts.json', JSONbig.stringify(Timeouts.filter(function (el) {
    return el != null && el != '';
  })), encoding = 'utf-8', function (error) {
    if (error) throw error;
  });
}

async function pubgUpdate () {
  var tempsad = 0;
  if (fs.existsSync(PATH)) {
    json = JSONbig.parse(fs.readFileSync(PATH));
  }
  await asyncForEach(json, async (element) => {
    if (element.command == 'pubg') {
      if (tempsad <= 7) {
        tempsad++;
        let obj = await getObj(element.nickname);

        let jsons = await getJson(obj).then(function (json) {
          return json;
        }).catch(function (err) {
          console.log(err);
        });
        kds = Math.round((jsons['data']['attributes']['gameModeStats']['squad-fpp'].kills / jsons['data']['attributes']['gameModeStats']['squad-fpp'].losses) * 10) / 10;
        await checkRoles(Guild.members.find(x => x.id == element.memberid));
      }
    }
  });
}

async function checkRoles (user) {
  let temp = 0;
  try {
    await asyncForEach(Roles, async (role) => {
      if (kds >= role.kd) temp++;
      let rolet = user.roles.find(x => x.id == role.roleID);
      if (rolet != null) {
        await user.removeRole(rolet.id);
      };
    });
    if (temp != 0) await user.addRole(Roles[temp - 1].roleID);
  } catch (e) {
    console.log(e);
  }
}

async function getObj (nickname) {
  checkBool = true;
  while (checkBool) {
    try {
      const response = await rp({
        uri: `https://api.pubg.com/shards/steam/players?filter[playerNames]=${nickname}`,
        headers: {
          accept: 'application/vnd.api+json',
          Authorization: `Bearer ${api_key}`
        },
        json: true
      });
      checkBool = false;
      return response['data'][0]['id'].substring(8);
    } catch (e) {
    }
    await delay(2000);
  }
}

async function getJson (userID) {
  checkBool = true;
  while (checkBool) {
    try {
      const a = await rp({
        uri: `https://api.pubg.com/shards/steam/players/${userID}/seasons/${currSeason}`,
        headers: {
          accept: 'application/vnd.api+json',
          Authorization: `Bearer ${api_key}`
        },
        json: true
      });
      checkBool = false;
      return a;
    } catch (e) {
    }
    await delay(2000);
  }
}

async function currentSeason () {
  
  }).then(function (json) {
    currSeason = json['data'].slice(-1)[0]['id'];
  }).catch(function (err) {
    console.log(err);
  });
}

function add (accumulator, a) {
  return accumulator + a;
}

async function asyncForEach (array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function delay (ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

client.login('NTc2NDQwMDA1NjMxODAzNDAz.XNWh4w.dCKVf2BH6HEYBN9wowzw_VRhvFE');
