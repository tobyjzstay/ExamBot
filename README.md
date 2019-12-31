# ExamBot
A bot created to provide information about the Victoria University of Wellington (VUW) examination times for Discord.

##  Demo
Experiment with ExamBot in the [ECS Test Environment](https://discord.gg/x4S3hYP) server - made for testing the bot out.

A course specified by the user displays information about the next exam:
![!exam comp102](https://lh4.googleusercontent.com/l-tGQpFrXsd-tjB58Fh0Vf6E_5HSMgfFYSsxV7IgPWdwH6nmCo03a3Oq8aFPQxf2UCVTLLo29uHPQtaq8FqT=w1920-h937)

If a user has selected their course roles, they can find out all their exam information for the current trimester with a single command:
| ![user](https://lh4.googleusercontent.com/WojvfNMegeReTECjktae3Q7qaEJAXYucTI34dI8f2zl_ScD7YGrzpWswksRbUc6K83WPHpViOn_4iTcNMxPW=w1920-h937) |  ![!exams](https://lh4.googleusercontent.com/fNUPx3TRly7OxpkHwvNqhJ_b9glLsevch_O4vVOQGLpHWcso5vJ6CvJfryvo5hAc8Qh7FjFFUB9pBHosWU-B=w1920-h937)|
|--|--|

Admins of the server can send the exam information to each course channel that is pinned with the notify command:
![notify all](https://lh5.googleusercontent.com/_n1MR7iLGp3FqWWR-w_caSnwMqDbNfqGpSK1fbUmEyKkRdRB_jGdhr_ckLQmVl7zJgjP9dl3Mo7rsYkyJeEL=w903-h620-rw)

### Commands
All of ExamBot commands can be found listed below:
|Command|Description|
|--|--|
| **```!about```** | Displays information about the bot. |
|**```!exam <course> [course ...]```**|Displays examination information for the course arguments.|
|**```!exams```**|Displays examination information for each of the user's course roles.|
|**```!help```**|Displays information for all the bot commands.|
|**```!list```**|Displays examination information for all the exam data.|
|**```!notify { <channel> [channel ...] | all }```**|Sends examination information to all the course channels.|
|**```!refresh```**|Updates the examination information for the current course channel.|
|**```!setprefix <prefix>```**|Changes the prefix for all the bot commands.|
|**```!seturl <url>```**|Changes the URL to fetch updated exam data.|
|**```!status```**|Displays statistics about the bot.|
|**```!update```**|Updates exam data from the set URL.|

## Getting Started

### Prerequisites
- Discord Account ([Don't have one?](https://discordapp.com/register))
- Text Editor (I recommend [Atom](https://atom.io/))

### Installing
Firstly, you will need [Git](https://git-scm.com/downloads) if you don't have it already installed to pull ExamBot from GitHub. Open a bash terminal with Git in your desired file location and pull ExamBot with the following command:
```git clone https://github.com/tobyjzstay/ExamBot.git```

Before you can do anything with the bot, you will need to create a bot. Head over to the [Discord Developer Portal](https://discordapp.com/developers/applications/) and click **New Application** at the top right corner and name it **ExamBot** (or whatever you like).
![Applications](https://lh3.googleusercontent.com/RPLBf21_tToaI180tXcDSPvQfnmF1FBxGyA1rPfdFqhNuFWODl4T3gpQZSC0yQ_gIYNcqWhE-uOM01uThtHp=w1920-h937-rw)

You will be navigated to the **General Information** page for the bot. While you are here, you can add the image icon for the bot named `icon.jpg` in the `~/ExamBot` folder you pulled from GitHub and click **Save Changes** at the bottom.
![General Information](https://lh5.googleusercontent.com/ltFzEjr4fUCErYLT74PLek3DjqDwTL3RIhUlcJUDh870iiw7YcIH9kqzZz333vCo_snHfpUFQbJ43r8tmflE=w1920-h937-rw)

Navigate to the **Bot** tab on the left-hand side and click the **Add Bot** on the right side. Confirm you want to make a bot. Now you should have successfully created the bot!
![Bots](https://lh4.googleusercontent.com/RwwlQmS_mb17y0wYmA0JnkezHM93i7P1_pCQqkbfXtJWLm2QoU_2sQisFN8fy30sSllMAzHk2tb9qoe6MrIU=w1920-h937-rw)
A few key pieces of information are needed before you leave the page. You will need to copy the token for the bot so click **Copy** and save this somewhere for later.

Navigate to the **OAuth2** tab on the left-hand side and check the **bot** and **Administrator** boxes (you may need to scroll down). Click **Copy** to copy the URL which is an invitation link to add the bot to a server.
![OAuth2](https://lh4.googleusercontent.com/AovpLkjmUhGlcjEPoGTqVa9qqhIU498WN4qGhBlQhOC8-nf11aLfxLebOvJtepf713VyIUaDDhOYjdQrSE9I=w1920-h937-rw)
Open a browser and paste the URL you just copied and add your bot to your desired server:
![ExamBot](https://lh3.googleusercontent.com/V44hiSsT9Py4O1nT4iEiF_hdlLVNGS6LCAYZEbj7FKacGTkA2htmekoadvgs1aN-SNp-zMdDAAYNtK-MtejP=w1920-h937-rw)

Before we run the bot, you need to create a file to store the token named `auth.json` and copy the following:

    {
     "token": "<token>"
    }

Replace ```<token>``` with the token you copied and stored earlier and save the file in the `~/ExamBot` folder.

Now that you have the files on your machine and the bot ready to go, you will need [Node.js](https://nodejs.org/en/download/) to run the bot. Open a bash terminal and navigate to the file location;  `~/ExamBot`.
You will need to install some node modules that ExamBot relies on to function:

```npm i discord.js```

```npm i download-file```

```npm i xlsx```

Your bot should be ready to go now! Run the bot with the command:

```node index.js```

### Setup
Make sure that you are an admin of the server, you will need this to run the configuration commands.

ExamBot commands can be found with the following command:

```!help```

Ensure that the bot is retrieving exam data from the correct place. You can find the exam data URL source on VUW's website at [Timetables](https://www.wgtn.ac.nz/students/study/timetables) on the right-hand sidebar (a timetable `.xlsx` file). Right-click the link and select **Copy link address** and set the URL with the bot command:

```!seturl <url>```

If you have done this correctly, running the update command to fetch and process the exam data should produce no errors:

```!update```

Now all the data has been imported into the code, we can find out when the next exam for a course is. E.g:

```!exam comp102```

We can speed this process up by using the notify command to send the exam information to each course channel that we have exam data for (**WARNING:** You will notify a large number of channels in the process):

```!notify all```

Finally, make sure that the command doesn't clash with any other bots in the server:

```!setprefix```

## Sources

### Author
Toby Stayner

### Built With
- [Atom](https://atom.io/)
- [Git SCM](https://git-scm.com/)
- [Node.js](https://nodejs.org/)
- [Raspberry Pi ](https://www.amazon.com/Vilros-Raspberry-Clear-Power-Supply/dp/B01D92SSX6/ref=sxin_4_osp20-dbbd4695_cov?ascsubtag=dbbd4695-7cc9-4675-ab42-4b0d8ccd0bac&creativeASIN=B01D92SSX6&cv_ct_id=amzn1.osp.dbbd4695-7cc9-4675-ab42-4b0d8ccd0bac&cv_ct_pg=search&cv_ct_wn=osp-search&keywords=Raspberry+Pi&linkCode=oas&pd_rd_i=B01D92SSX6&pd_rd_r=d894dcf2-b66e-46d3-a717-0bd4a6479c14&pd_rd_w=UasGh&pd_rd_wg=z0YRm&pf_rd_p=a23a388c-add5-49df-b293-a31ade89c6bf&pf_rd_r=P9DQK2S2SNYRT10RZQA3&qid=1573167792&s=electronics&tag=bestcont06-20)

### Acknowledgments
- Bot Icon: [Chris Liverani - Unsplash](https://unsplash.com/photos/ViEBSoZH6M4)

This project is not affiliated with Victoria University of Wellington.
