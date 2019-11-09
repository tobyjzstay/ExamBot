const Discord = require('discord.js');
const fs = require("fs");

var TOKEN;
var PREFIX = '!';

const client = new Discord.Client();

if (fs.existsSync('./auth.json')) {
  const { token } = require('./auth.json');
  TOKEN = token;
}

if (fs.existsSync('./config.json')) {
  const { prefix } = require('./config.json');
  PREFIX = prefix;
}

client.on('ready', () => {
  client.user.setStatus('online');
  client.user.setActivity(`${PREFIX}help`);
  console.log(`${client.user.tag} connected at ${new Date()}\n`);
});

client.login(TOKEN);
