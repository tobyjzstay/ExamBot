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

client.on('message', message => {
  if (!message.content.startsWith(PREFIX)) return;
  const args = message.content.slice(PREFIX.length).split(/ +/);
  if (args[0] == 'about') {
    const embeddedMessage = new Discord.RichEmbed()
      .setColor('#115737')
      .setAuthor('Examination Information')
      .setTitle('About')
      .setDescription('A bot created to provide information about Victoria University of Wellington examination times for Discord.')
      .setFooter('Made by Toby', 'https://avatars0.githubusercontent.com/u/38903351'); // github profile picture
    message.channel.send(embeddedMessage);
  }
});

client.login(TOKEN);
