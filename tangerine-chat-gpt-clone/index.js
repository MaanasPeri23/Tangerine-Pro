import express from 'express';
import bodyParser from 'body-parser';
import OpenAIApi from 'openai';
import dotenv from 'dotenv';

// API Setup
dotenv.config();
const app = express();
const openai = new OpenAIApi({ apiKey: process.env.OPENAI_API_KEY });
app.use(bodyParser.json());
app.use(express.static('public'));

// generate chat completions
async function generateChat(history) {
  let newMessages = [{ role: 'system', content: 'You are a helpful assistant.' }];
  // Combine system message with user's conversation history
  newMessages = newMessages.concat(history);
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: newMessages,
  });

  return response.choices[0].message.content;
}

// Endpoint to handle chat messages and send responses
app.post('/api/chat', async (req, res) => { // the difference between req and res is that req is the request object, and res is the response object. a request object is  what the client sends to the server, and the response object is what the server sends back to the client.

  const conversationHistory = req.body.history;
  try {
    // Logging convo
    console.log(conversationHistory);
    const chatBotMessage = await generateChat(conversationHistory);
    console.log(chatBotMessage);
    res.json({ reply: chatBotMessage }); 

  } catch (error) {

    console.error('Error communicating with OpenAI API:', error);
    res.status(500).send('Error generating response');
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
