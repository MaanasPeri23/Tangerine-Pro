### How to run this project:

To run my web application run the following command below. This command starts the websocket server in NodeJS, and sets up the index.js file that runs my transcript display ReactJS. These communicate via websocket protocols.

(Make sure to run the following command in the tangerine-web-application directory)

```
npm start
```

Additionally, after running this command, make sure to setup your XCode environment, select a simulator, and run the tangerine-ios-application. It's imperative to run the previous command before running this project, because then the Swift client wouldn't be able to listen and communicate back and forth on the same websocket port. (Make sure to open the tangerine-ios-application directory only)

While I haven't been able to merge my chatgpt interface with the transcript display, feel free to run it separately using:

```
npm install
node index.js
```

Hopefully you have everything you need to have a working demo on your localhost browser! Currently working on more features and aim to deploy this application before/during the summer of 2024.

### Presentation + Demo:

I detailed my current and past architecture designs over time, and why I chose to make these decisions. I also give a demo of how my project operates, and list out the next concrete steps moving forward.

Check it out here: https://shorturl.at/ANTZ8

As always if you have any comments, concerns, or questions feel free to reach out to me via my socials, or open up a Github Issue. There are plenty of bugs within the current project but feel free to point out anything noteworthy:)
