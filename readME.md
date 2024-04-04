### Problem
If an esteemed speaker came to my school for a research conference and gave tons of new technical insights that I want to explore, how do I retain all this information in Apple Notes and keep listening for more content at the same time? If I wanted to ask this speaker a few questions about their work without sounding inexperienced, how would I feed this context to GPT to come up with questions? 

Attending networking panels often presents the challenge described above. The wealth of information shared by panel speakers can be overwhelming, and establishing meaningful connections with the content for several days/weeks can be challenging. I mean, when was the last time you referred to previous meeting Apple notes? These hurdles hinder effective networking opportunities.

### Solution
Imagine if an interviewer could place their phone on a nearby coffee table during the panel, streaming the entire conversation and converting the audio into a live, accessible transcript for all attendees on their own web browser. This transcript, available through an online notebook, allows graduate students to engage in live group discussions, reflect on the dialogue weeks after the event has ended, and freely ask customized questions based on the context of the discussion, and continue deepening their analyses on private knowledge.

### Implementation Details
In this solution, the key lies in using the private knowledge shared during the conversation to inform interactions with GPT (Generative Pre-trained Transformer). By integrating GPT into the platform, users can pose custom questions tailored to the ongoing dialogue, receiving real-time responses based on the current context. This not only enhances engagement during the event but also fosters deeper understanding and meaningful conversations among attendees.

### Future Development
Looking ahead, the vision extends beyond a real-time transcription tool. I envision developing this platform into a personalized networking notebook (similar interface to that of Notion) with additional features exclusively for graduate students/faculty attending conferences. These features could include recording the full transcript of events, integrating GPT interactions for personalized networking prompts, and incorporating student-centric tools for educational and professional networking events. This comprehensive approach aims to transform networking experiences, facilitating meaningful connections and insightful exchanges in various settings.

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

Check it my technical presentation here: https://shorturl.at/ANTZ8

As always if you have any comments, concerns, or questions feel free to reach out to me via my socials, or open up a Github Issue. There are plenty of bugs within the current project but feel free to point out anything noteworthy:)
