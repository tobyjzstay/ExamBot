const Discord = require('discord.js');
const fs = require("fs");
const download = require('download-file');
const xlsx = require('xlsx');

var TOKEN;
var PREFIX = '!';
var URL = 'https://www.victoria.ac.nz/__data/assets/excel_doc/0005/1766759/end-of-year-exam-timetable.xlsx';
var FILENAME = "data.xlsx";

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
  var options = { filename: FILENAME };
  download(URL, options, function(error){
    if (error) {
      console.error(error);
      return false;
    } else return true;
  })
}

var data = {};

function processData() {
  var stream = fs.createReadStream(FILENAME);
  var buffers = [];
  stream.on('data', function(data) { buffers.push(data); });
  stream.on('end', function() {
    var buffer = Buffer.concat(buffers);
    var workbook = xlsx.read(buffer, {type:"buffer"});
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];
    for (var y = 4; y <= 289; y++) {
      var examCell = worksheet['A'+y];
      var examValue = (examCell ? examCell.v : undefined);
      var exam = parseExam(examValue);
      if (exam != undefined) {
        var durationCell = worksheet['B'+y];
        var durationValue = (durationCell ? durationCell.v : undefined);
        var duration = parseDuration(durationValue);
        var dateCell = worksheet['C'+y];
        var dateValue = (dateCell ? dateCell.v : undefined);
        var date = parseDate(dateValue);
        var startCell = worksheet['D'+y];
        var startValue = (startCell ? startCell.v : undefined);
        var start = parseStart(startValue);
        var roomsCell = worksheet['E'+y];
        var roomsValue = (roomsCell ? roomsCell.v : undefined);
        var rooms = parseRooms(roomsValue);
        data[exam] = { duration: duration, date: date, start: start, rooms: rooms }
      }
    }
  });
}

function parseExam(exam) {
  if (/^[a-zA-Z]{4}[0-9]{3}/.test(exam)) {
    return exam.slice(0, 7).toUpperCase();
  } else return undefined;
}

function parseDuration(duration) {
  return duration;
}

function parseDate(date) {
  var date = new Date((date-25569)*86400000);
  return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
}

function parseStart(start) {
  var hour = Math.floor(start*24);
  var minute = Math.floor(start*24%1*60);
  var meridiem = 'AM';
  if (hour >= 12) meridiem = 'PM';
  return `${hour%12}:${minute} ${meridiem}`
}

function parseRooms(rooms) {
  if (true) {
    return rooms;
  } else return undefined;
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
  } else if (args[0] == 'exam') {
    if (args.length < 2) {
      message.reply(`missing arguments. Valid arguments: \`!exam <course>\` e.g. \`!exam comp102\``);
      return;
    }
    var exam = parseExam(args[1].toUpperCase());
    if (exam != undefined) {
      var datum = data[exam];
      if (datum != undefined) {
        const embeddedMessage = new richEmbedTemplate()
          .setTitle('Exam Times')
          .setDescription(`\`\`\`${exam}\t${datum.duration}\t${datum.date}\t${datum.start}\t${datum.rooms}\`\`\``)
          .addField('\u200b', 'To find out your room, login into [Student Records](https://student-records.vuw.ac.nz).')
        message.reply(embeddedMessage);
      } else message.reply(`couldn't find exam data for '${args[1]}'. Does the course exist for the current trimister?`);
    } else message.reply(`invalid course. Valid arguments: \`!exam <course>\` e.g. \`!exam comp102\``);
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
processData();

client.login(TOKEN);
