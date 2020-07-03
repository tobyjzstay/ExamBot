# ExamBot

A Discord bot which provides information about the Victoria University of Wellington examination times.

I wanted to help extend <a href="https://github.com/alexsurelee/VicBot" target="_blank">VicBot</a> (a bot for the Engineering and Computer Science Discord server at Victoria University of Wellington) by providing examination information about the courses. The functionality of the bot supports channels with a single course as well as users that have multiple courses.

## Demo

![](http://www.swengineer.dev/images/exam.png)

*Users can retrieve examination information about their courses.*

![](http://www.swengineer.dev/images/notify.gif)

*Admins can notify all course channels for their respective exam.*

## Download

Clone the repository at <a href="https://github.com/tobyjzstay/ExamBot" target="_blank">GitHub</a> and follow the [Getting Started](#getting-started) instructions.

## Commands

| Command                          | Description                                                             |
| :------------------------------- | :---------------------------------------------------------------------- |
| `about`                          | Displays information about the bot                                      |
| `exam <course> [course ...]`     | Displays examination information for the course arguments               |
| `exams`                          | Displays examination information for each of the user's course roles    |
| `help`                           | Displays information for all the bot commands                           |
| `list`                           | Displays examination information for all the exam data                  |
| `notify all`                     | Sends examination information to all the course channels                |
| `notify <channel> [channel ...]` | Sends examination information to course channels specified in arguments |
| `refresh`                        | Updates the examination information for the current course channel      |
| `setprefix <prefix>`             | Changes the prefix for all the bot commands                             |
| `seturl <url>`                   | Changes the URL to fetch updated exam data                              |
| `status`                         | Displays statistics about the bot                                       |
| `update`                         | Updates exam data from the set URL                                      |

## Getting Started

Create a new Discord bot at the <a href="https://discord.com/developers" target="_blank">Discord Developer Portal</a> and copy the token. More information about generating a new bot can be found <a href="https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot/" target="_blank">here</a>. You will need to create a file to store the token named `auth.json` and copy the following:

```json
{
 "token": "<token>"
}
```

Replace `<token>` with the token and save the file in the `~/ExamBot` folder.

Now that you have the files on your machine and the bot ready to go, you will need <a href="https://nodejs.org/en/download/" target="_blank">Node.js</a> to run the bot. Open a bash terminal and navigate to the file location; `~/ExamBot`.
You will need to install some node modules that ExamBot relies on to function:

```bash
npm i discord.js
npm i download-file
npm i xlsx
```

Your bot should be ready to go now. Run the bot with the command:

```bash
node index.js
```

### Setup

Make sure that you are an admin of the server, you will need this to run the configuration commands.

ExamBot commands can be found with the following command:

`!help`

Ensure that the bot is retrieving exam data from the correct place. You can find the exam data URL source on VUW's website at <a href="https://www.wgtn.ac.nz/students/study/timetables" target="_blank">Timetables</a> on the right-hand sidebar (a timetable `.xlsx` file). Right-click the link and select **Copy link address** and set the URL with the bot command:

`!seturl <url>`

If you have done this correctly, running the update command to fetch and process the exam data should produce no errors:

`!update`

Now all the data has been imported into the code, we can find out when the next exam for a course is; e.g. COMP102:

`!exam comp102`

We can speed this process up by using the notify command to send the exam information to each course channel that we have exam data for:

`!notify all`

Finally, make sure that the command doesn't clash with any other bots in the server:

`!setprefix <prefix>`

## Acknowledgments
* Bot Icon: <a href="https://unsplash.com/photos/ViEBSoZH6M4" target="_blank">Chris Liverani - Unsplash</a>

This project is not affiliated with Victoria University of Wellington.
