const Discord = require('discord.js');
const fs = require("fs");
const download = require('download-file');

var TOKEN;
var PREFIX = '!';
var URL = 'https://www.victoria.ac.nz/__data/assets/excel_doc/0005/1766759/end-of-year-exam-timetable.xlsx';

const client = new Discord.Client();

if (fs.existsSync('./auth.json')) {
  const { token } = require('./auth.json');
  TOKEN = token;
} else {
  throw 'Missing auth.json file containing the token for the bot!';
}

if (fs.existsSync('./config.json')) {
  const { prefix, url } = require('./config.json');
  PREFIX = prefix;
  URL = url;
} else {
  console.log('Missing config.json file configuration settings for the bot! Default settings will be used.');
}

function fetchData() {
  var options = { filename: "data.xlsx" };
  download(URL, options, function(error){
    if (error) {
      console.error(error);
      return false;
    } else return true;
  })
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
    const embeddedMessage = new richEmbedTemplate()
      .setTitle('About')
      .setDescription('A bot created to provide information about Victoria University of Wellington examination times for Discord.')
      .setFooter('Made by Toby', 'https://avatars0.githubusercontent.com/u/38903351'); // github profile picture
    message.channel.send(embeddedMessage);
  } else if (args[0] == 'status') {
    const embeddedMessage = new richEmbedTemplate()
      .setTitle('Status')
      .setDescription(`The bot has been running since ${client.readyAt} (${formatTime(client.uptime)})`);
    message.channel.send(embeddedMessage);
  } else if (args[0] == 'fetch') {
    if (fetchData()) message.reply("an error has occurred attempting to fetch the exam data.");
    else message.reply("successfully fetched the exam data.");
  }
});

function richEmbedTemplate() {
  const logo = new Discord.Attachment('./vuw-logo.png', 'vuw-logo.png');
  var embed = new Discord.RichEmbed()
    .attachFile(logo)
    .setColor('#115737')
    .setAuthor('Examination Information', 'attachment://vuw-logo.png', 'https://www.victoria.ac.nz/students/study/timetables')
    return embed;
}

function formatTime(milliseconds) {
  let totalSeconds = (milliseconds / 1000);
  let days = Math.floor(totalSeconds / 86400);
  let hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = Math.floor(totalSeconds % 60);
  return `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;
}

fetchData();
client.login(TOKEN);
