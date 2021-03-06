/**
* ExamBot
*
* A Discord bot created to provide information about Victoria University of Wellington examination times.
* @author Toby Stayner
*/
const Discord = require('discord.js');
const fs = require("fs");
const download = require('download-file');
const xlsx = require('xlsx');
const { Console } = require('console');

const client = new Discord.Client();
const DATA_FILE = 'data.xlsx';
const AUTH_FILE = './auth.json';
const CONFIG_FILE = './config.json';

let TOKEN = process.env.token;
let PREFIX = process.env.prefix;
let URL = process.env.url;

var MAX_EMBED = 2000; // maximum characters allowed per embedded message
var data = {};

// retrive the token
if (fs.existsSync(AUTH_FILE)) {
  const { token } = require(AUTH_FILE);
  TOKEN = token;
} else { // bot can't do much without a token...
  throw 'Missing auth.json file containing the token for the bot!';
}

// load configuration settings if there is a config file
if (fs.existsSync(CONFIG_FILE)) {
  const { prefix, url, max_embed } = require(CONFIG_FILE);
  PREFIX = prefix;
  URL = url;
  MAX_EMBED = max_embed;
} else {
  console.log('Missing config.json file configuration settings for the bot! Default settings will be used.');
}

/**
* Retrives data from the source, keeping the data up to date.
*/
function fetchData() {
  var options = { filename: DATA_FILE, timeout: 500 };
  download(URL, options, function(error) {
    if (error || error == 'Timeout' || error == 404) console.error(error);
  });
}

/**
* Takes the data file and adds it to the object data array.
*/
function processData() {
  var stream = fs.createReadStream(DATA_FILE);
  var buffers = [];
  stream.on('data', function(data) { buffers.push(data); });
  stream.on('end', function() {
    var buffer = Buffer.concat(buffers);
    var workbook = xlsx.read(buffer, {type:"buffer"});
    var sheet = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[sheet];
    var y = 4;
    while (true) {
      var examValue = getValue(worksheet, 'A'+y);
      var exam = parseExam(examValue);
      if (exam != undefined) {
        var durationValue = getValue(worksheet, 'B'+y);
        var dateValue = getValue(worksheet, 'C'+y);
        var startValue = getValue(worksheet, 'D'+y);
        var roomsValue = getValue(worksheet, 'E'+y);
        data[exam] = { duration: durationValue, date: dateValue, start: startValue, rooms: roomsValue }
        y++;
      } else break;
    }
  });
}

/**
* Returns a worksheet's cell value.
* @param {object}
* @param {string}
* @return {any}
*/
function getValue(worksheet, id) {
  var cell = worksheet[id];
  var value = (cell ? cell.v : undefined);
  return value;
}

/**
* Checks if the input is a valid exam.
* @param {string}
* @return {any}
*/
function parseExam(exam) {
  if (/^[a-zA-Z]{4}[0-9]{3}/.test(exam)) {
    return exam.slice(0, 7).toUpperCase();
  } else if (/^[a-zA-Z]{4}-[0-9]{3}/.test(exam)) {
    return exam.slice(0, 4).toUpperCase() + exam.slice(5, 8);
  } else return undefined;
}

/**
* Returns the last time the data file was modified.
* @return {Date}
*/
function getExamLastUpdated() {
  const stats = fs.statSync(DATA_FILE);
  return stats.mtime;
}

/**
* Returns the channel name of the exam.
* @param {string}
* @return {string}
*/
function getChannel(exam) {
  return exam.slice(0, 4).toLowerCase() + '-' + exam.slice(4, 7);
}

/**
* Returns the duration.
* @param {number}
* @return {number}
*/
function parseDuration(duration) {
  return duration;
}

/**
* Converts the raw input into a string formatted date.
* @param {number}
* @return {string}
*/
function parseDate(date) {
  var date = convertToDate(date);
  var day = date.getDate();
  if (day.toString().length == 1) day = '0' + day;
  var month = date.getMonth()+1;
  if (month.toString().length == 1) month = '0' + month;
  return `${day}/${month}/${date.getFullYear()}`
}

/**
* Converts the raw input into a Date object.
* The input is a serial number which represents how many days past 1 Janurary 1900.
* Date objects can be created with serial numbers, but they start from 1 Janurary 1970.
* @param {number}
* @return {Date}
*/
function convertToDate(date) {
  return new Date((date-25569)*86400000); // 25569 accounts for serial number shift.
}

/**
* Converts the raw input into a string formatted start time.
* The input is a decimal value between 0 and 1, representing the amount of time past midnight of the day.
* @param {number}
* @return {string}
*/
function parseStart(start) {
  var hour = Math.floor(start*24);
  var minute = Math.floor(start*24%1*60);
  var meridiem = 'AM';
  if (hour >= 12) meridiem = 'PM';
  return `${hour%12}:${minute} ${meridiem}`
}

/**
* Returns the rooms.
* @param {string}
* @return {string}
*/
function parseRooms(rooms) {
  return rooms;
}

/**
* Checks if the input is a valid role.
* @param {string}
* @return {any}
*/
function parseRole(role) {
  if (/^[a-zA-Z]{4}-[0-9]{3}/.test(role)) {
    return role.slice(0, 4).toUpperCase() + role.slice(5, 8);
  } else return undefined;
}

/**
* Generates a formatted string containing the exam data.
* @param {object}
* @param {object}
* @param {boolean}
* @return {string}
*/
function formatExams(message, exams, displayErrors) {
  var examData = '';
  for (var i = 0; i < exams.length; i++) {
    var exam = parseExam(exams[i].toUpperCase());
    if (exam != undefined) {
      var datum = data[exam];
      if (datum != undefined) {
        examData += `${exam}\t${parseDuration(datum.duration)}\t${parseDate(datum.date)}\t${parseStart(datum.start)}\t${parseRooms(datum.rooms)}\n`;
      } else if (displayErrors) message.reply(`couldn't find exam data for '${exams[i]}'. Does the course exist for the current trimister?`);
    } else if (displayErrors) message.reply(`'${exams[i]}' is not a valid course.`);
  }
  return examData;
}

/**
* Called once when the bot is executed on startup.
*/
client.on('ready', () => {
  client.user.setStatus('online');
  client.user.setActivity(`${PREFIX}help`);
  console.log(`${client.user.tag} connected at ${new Date()}\n`);
});

/**
* Error handling.
*/
process.on("unhandledRejection", error =>
console.error(`Uncaught Promise Rejection:\n${error}`)
);
process.on("unhandledError", error =>
console.error(`Unhandled Error:\n${error}`)
);
client.on("disconnect", error => console.error(`Disconnected! \n${error}`));
client.on("error", console.error);

/**
* Called when a message is sent in the server.
*/
client.on('message', message => {
  if (!message.content.startsWith(PREFIX)) return; // the message must start with the prefix
  const args = message.content.slice(PREFIX.length).split(/ +/); // slice message into arguments

  // user commands
  if (args[0] == 'help') { // information about the bot
    var embeddedMessage = new blankEmbedTemplate()
    .setTitle('ExamBot Commands')
    .addField(`\u200b`, `\`${PREFIX}about\`\nDisplays information about the bot.`)
    .addField(`\u200b`, `\`${PREFIX}exam <course> [course ...]\`\nDisplays examination information for the course arguments.`)
    .addField(`\u200b`, `\`${PREFIX}exams\`\nDisplays examination information for each of the user's course roles.`)
    .addField(`\u200b`, `\`${PREFIX}help\`\nDisplays information for all the bot commands.`)
    .addField(`\u200b`, `\`${PREFIX}list\` (in direct messages)\nDisplays examination information for all the exam data.`)
    .addField(`\u200b`, `\`${PREFIX}status\`\nDisplays statistics about the bot.`);
    message.channel.send(embeddedMessage);
    embeddedMessage = new blankEmbedTemplate()
    .setTitle(`ExamBot Admin Commands`)
    .setDescription('**- Must be in the ECS Discord server as an Admin**')
    .addField(`\u200b`, `\`${PREFIX}list\`\nDisplays examination information for all the exam data.`)
    .addField(`\u200b`, `\`${PREFIX}notify { <channel> [channel ...] | all }\`\nSends examination information to all the course channels.`)
    .addField(`\u200b`, `\`${PREFIX}refresh\`\nUpdates the examination information for the current course channel.`)
    .addField(`\u200b`, `\`${PREFIX}setprefix <prefix>\`\nChanges the prefix for all the bot commands.`)
    .addField(`\u200b`, `\`${PREFIX}seturl <url>\`\nChanges the URL where to fetch updated exam data.`)
    .addField(`\u200b`, `\`${PREFIX}update\`\nUpdates exam data from the set URL.`);
    message.channel.send(embeddedMessage);
  } else if (args[0] == 'about') { // information about the bot
    const embeddedMessage = new richEmbedTemplate()
    .setTitle('About')
    .setDescription('A bot created to provide information about Victoria University of Wellington examination times for Discord.')
    .setFooter('Made by Toby', 'https://avatars0.githubusercontent.com/u/38903351'); // github profile picture
    message.channel.send(embeddedMessage);
  } else if (args[0] == 'status') { // statistics about the bot
    const embeddedMessage = new richEmbedTemplate()
    .setTitle('Status')
    .setDescription(`The bot has been running since ${client.readyAt} (${formatTime(client.uptime)})`)
    .addField(`Last updated: ${formatTime(new Date().getTime()-getExamLastUpdated().getTime())} ago.`, `\u200b`)
    .setTimestamp();
    message.channel.send(embeddedMessage);
  } else if (args[0] == 'exam') {
    if (args.length < 2) { // missing exam course
      message.reply(`missing arguments. Valid arguments: \`${PREFIX}exam <course> [course ...]\` e.g. \`${PREFIX}exam comp102\` \`${PREFIX}exam cgra-151 comp-103 engr-123\``);
      return;
    }
    // find exam courses
    var exams = [args.length-1];
    for (var i = 1; i < args.length; i++) {
      exams[i-1] = args[i];
    }
    var examData = formatExams(message, exams, true); // get the formatted data
    if (examData.length > MAX_EMBED) message.reply(`too many arguments to process. Try reducing the amount of arguments.`);
    else if (examData.length > 0) { // generate the embedded message
      const embeddedMessage = examDataEmbed(examData);
      message.reply(embeddedMessage);
    }
  } else if (args[0] == 'exams') {
    if (message.channel.type != 'text') { // direct message command
      message.reply('You need to be in the ECS Discord server to use this command. https://discord.gg/x4S3hYP');
      return;
    }
    // find the exam courses of the user by checking their roles
    var exams = new Array();
    message.member.roles.forEach(function(value) {
      var exam = parseRole(value.name);
      if (exam) exams.push(exam);
    });
    var examData = formatExams(message, exams, false); // get the formatted data
    if (examData.length > MAX_EMBED) message.reply(`too many arguments to process. Try reducing the amount of course roles you have.`);
    else if (examData.length > 0) { // generate the embedded message
      const embeddedMessage = examDataEmbed(examData);
      message.reply(embeddedMessage);
    } else message.reply('couldn\'t find exam data for your course roles for the current trimister.'); // none of the user courses were valid
  } else if (args[0] == 'refresh') {
    if (message.channel.type != 'text' || !message.member.hasPermission("ADMINISTRATOR")) { // direct message or admin command
      message.reply('You need to be in the ECS Discord server and have administrator privileges to use this command. https://discord.gg/x4S3hYP');
      return;
    }
    var channelName = message.channel.name;
    var exam = parseExam(channelName);
    if (exam) notifyExams(message, [exam], true);
    else message.reply(`invalid channel. Is <#${message.channel.id}> a course channel?`);
  } else if (args[0] == 'list') { // display all the exam data
    if (message.channel.type != 'text' || !message.member.hasPermission("ADMINISTRATOR")) { // direct message or admin command
      message.reply('You need to be in the ECS Discord server and have administrator privileges to use this command. https://discord.gg/x4S3hYP');
      return;
    }
    var exams = Object.keys(data);
    exams.sort(function(a, b) { // sort by alphabetical exam course
      if(a < b) { return -1; }
      if(a > b) { return 1; }
      return 0;
    })
    var examData = formatExams(message, exams, true); // get the formatted data
    // split the exam data into messages - based on the maximum embedded character limit
    var examDataMessages = new Array();
    var examDataList = examData.split("\n");
    var currentMessage = "";
    for (var i = 0; i < examDataList.length; i++) {
      if (currentMessage.length + examDataList[i].length > MAX_EMBED) { // adding the exam data will overflow the character count
        examDataMessages.push(currentMessage); // add the message to the array
        currentMessage = examDataList[i];
      } else { // add the exam data
        currentMessage += examDataList[i] + "\n";
      }
    }
    // generate the embedded messages
    for (var i = 0; i < examDataMessages.length; i++) {
      var embeddedMessage = new blankEmbedTemplate()
      .setDescription(`\`\`\`${examDataMessages[i]}\`\`\``)
      .setFooter(`Page ${i+1} of ${examDataMessages.length}`)
      .setTimestamp();
      if (i == examDataMessages.length-1) { // last message
        embeddedMessage.addField(`Last updated: ${formatTime(new Date().getTime()-getExamLastUpdated().getTime())} ago.`, `To find out your room, log in to [Student Records](https://student-records.vuw.ac.nz).`)
          embeddedMessage.setTimestamp();
        }
        message.channel.send(embeddedMessage);
      }
    }
    else if (args[0] == 'notify') {
      if (message.channel.type != 'text' || !message.member.hasPermission("ADMINISTRATOR")) { // direct message or admin command
        message.reply('You need to be in the ECS Discord server and have administrator privileges to use this command. https://discord.gg/x4S3hYP');
        return;
      }
      if (args.length < 2) { // missing exam course
        message.reply(`missing arguments. Valid arguments: \`${PREFIX}notify <course> [course ...]\` e.g. \`${PREFIX}notify comp102\` \`${PREFIX}notify cgra-151 comp-103 engr-123\``);
        return;
      } // find all the exam courses
      if (args[1] == 'all') {
        var exams = Object.keys(data);
        for (var i = 1; i < args.length; i++) {
          exams[i-1] = args[i];
        }
        var notified = notifyExams(message, [exams], false); // send exam data to each channel
        message.reply(`successfully notified ${notified} channels.`);
      } else { // find exam courses in arguments
        var exams = [args.length-1];
        for (var i = 1; i < args.length; i++) {
          exams[i-1] = args[i];
        }
        notifyExams(message, exams, true); // send exam data to each channel
      }
    } else if (args[0] == 'setprefix') { // updates the url to fetch the data from
      if (message.channel.type != 'text' || !message.member.hasPermission("ADMINISTRATOR")) { // direct message or admin command
        message.reply('You need to be in the ECS Discord server and have administrator privileges to use this command. https://discord.gg/x4S3hYP');
        return;
      }
      if (args.length < 2) message.reply(`missing arguments. Valid arguments: \`${PREFIX}setprefix <prefix>\``); // missing exam course
      else if (args[1] == PREFIX) message.reply(`that prefix is already in use.`); // same prefix
      else {
        PREFIX = args[1];
        // update the config file
        var file = require(CONFIG_FILE);
        file.prefix = PREFIX;
        fs.writeFile(CONFIG_FILE, JSON.stringify(file, null, 2), function (error) {
          if (error) return console.log(error);
        });
        client.user.setActivity(`${PREFIX}help`);
        message.reply(`successfully changed the prefix to \`${PREFIX}\``);
      }
    } else if (args[0] == 'seturl') { // updates the url to fetch the data from
      if (message.channel.type != 'text' || !message.member.hasPermission("ADMINISTRATOR")) { // direct message or admin command
        message.reply('You need to be in the ECS Discord server and have administrator privileges to use this command. https://discord.gg/x4S3hYP');
        return;
      }
      if (args.length < 2) { // missing url
        message.reply(`missing arguments. Valid arguments: \`${PREFIX}seturl <url>\``);
        return;
      } else if (validExamURL(args[1])) {
        URL = args[1];
        // update the config file
        var file = require(CONFIG_FILE);
        file.url = URL;
        fs.writeFile(CONFIG_FILE, JSON.stringify(file, null, 2), function (error) {
          if (error) return console.log(error);
        });
        message.reply(`successfully updated the URL. To update the exam data, use \`${PREFIX}update\``);
      } else message.reply("invalid URL. Does the URL end with `./xlsx`?");
    } else if (args[0] == 'update') { // retrives the data from the source and processes it
      if (message.channel.type != 'text' || !message.member.hasPermission("ADMINISTRATOR")) { // direct message or admin command
        message.reply('You need to be in the ECS Discord server and have administrator privileges to use this command. https://discord.gg/x4S3hYP');
        return;
      }
      if (fetchData()) message.reply("an error has occurred attempting to fetch the exam data. Is the URL valid?");
      else {
        if (new Date() - getExamLastUpdated() < 10000) {
          processData();
          message.reply("successfully fetched and processed the exam data.");
        } else message.reply("an error has occurred attempting to fetch the exam data. Is the URL valid?");
      }
    }
  });

  /**
  * Generates a formatted string containing the exam data and sends it to its respective channel.
  * @param {object}
  * @param {object}
  * @param {boolean}
  * @return {number}
  */
  function notifyExams(message, exams, displayErrors) {
    var notified = 0;
    for (var i = 0; i < exams.length; i++) {
      var exam = parseExam(exams[i].toUpperCase());
      if (exam != undefined) { // valid exam
        var examChannel = getChannel(exam);
        var datum = data[exam];
        if (datum != undefined) { // valid exam course code
          var channel = client.channels.find(channel => channel.name == examChannel);
          if (channel != undefined) { // channel exists for the exam
            var examData = formatExams(message, exam, false); // get the formatted data
            if (examData.length > 0) { // generate the embedded message
              const embeddedMessage = examDataEmbed(examData);
              // delete all old exam data in the course channel
              channel.fetchMessages().then(messages => messages.filter(m => m.author.id == client.user.id)).then(messages => {
                let arr = messages.array();
                for (let i = 0; i < arr.length; i++) {
                  arr[i].delete();
                }
              });
              channel.send(embeddedMessage).then(msg => msg.pin()); // pin the message
              notified++;
            }
          } else if (displayErrors) message.reply(`couldn't find the channel for '${exams[i]}'. Does the channel #${examChannel} exist?`);
        } else if (displayErrors) message.reply(`couldn't find exam data for '${exams[i]}'. Does the course exist for the current trimister?`);
      } else if (displayErrors) message.reply(`'${exams[i]}' is not a valid course.`);
    }
    return notified;
  }

  /**
  * Generates an embedded message template, includuing the bot logo.
  * @return {object}
  */
  function richEmbedTemplate() {
    const icon = new Discord.Attachment('./icon.jpg', 'icon.jpg');
    var embed = new Discord.RichEmbed()
    .attachFile(icon)
    .setColor('#115737')
    .setAuthor('Examination Information', 'attachment://icon.jpg', 'https://www.victoria.ac.nz/students/study/timetables');
    return embed;
  }

  /**
  * Generates an embedded message template which is basic.
  * @return {object}
  */
  function blankEmbedTemplate() {
    var embed = new Discord.RichEmbed()
    .setColor('#115737');
    return embed;
  }

  /**
  * Generates an embedded message with the exam data provided.
  * @param {string}
  * @return {object}
  */
  function examDataEmbed(examData) {
    const embeddedMessage = new richEmbedTemplate()
    .setTitle('Exam Times')
    .setDescription(`\`\`\`${examData}\`\`\``)
    .addField(`Last updated: ${formatTime(new Date().getTime()-getExamLastUpdated().getTime())} ago.`, `To find out your room, log in to [Student Records](https://student-records.vuw.ac.nz).`)
      .setTimestamp();
      return embeddedMessage;
    }

    /**
    * Converts milliseconds into a string formatted time.
    * @param {number}
    * @return {string}
    */
    function formatTime(milliseconds) {
      let totalSeconds = (milliseconds / 1000);
      let days = Math.floor(totalSeconds / 86400);
      totalSeconds %= 86400;
      let hours = Math.floor(totalSeconds / 3600);
      totalSeconds %= 3600;
      let minutes = Math.floor(totalSeconds / 60);
      let seconds = Math.floor(totalSeconds % 60);
      return `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;
    }

    /**
    * Returns whether the input is a valid exam url address.
    * @param {string}
    * @return {boolean}
    */
    function validExamURL(url) {
      var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      return pattern.test(url) && url.endsWith('.xlsx');
    }

    // update and process the data before running the client
    fetchData();
    processData();

    client.login(TOKEN);
