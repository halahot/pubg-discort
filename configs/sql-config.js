const CommonService = require('../src/services/common-service.js');
const path = require('path')
const dbPath = path.resolve(__dirname, '../bot.db')
const sqlite3 = require('sqlite3').verbose();
// import * as logger from './logger.config';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the bot database.');
});

db.run('CREATE TABLE IF NOT EXISTS players(id SERIAL PRIMARY KEY, pubg_id TEXT UNIQUE, username TEXT, platform TEXT);');
db.run('CREATE TABLE IF NOT EXISTS servers(id SERIAL PRIMARY KEY, server_id TEXT UNIQUE,' +
  'default_bot_prefix TEXT default_region TEXT, default_mode TEXT);');
db.run('CREATE TABLE IF NOT EXISTS server_registery' +
  '(id SERIAL PRIMARY KEY,' +
  'fk_players_id integer REFERENCES players (id) ON DELETE CASCADE,' +
  'fk_servers_id integer REFERENCES servers (id) ON DELETE CASCADE);');
db.run('CREATE TABLE IF NOT EXISTS user_registery' +
  '(id SERIAL PRIMARY KEY,' +
  'discord_id TEXT UNIQUE,' +
  'fk_players_id integer REFERENCES players (id) ON DELETE CASCADE);');

module.exports = db;
