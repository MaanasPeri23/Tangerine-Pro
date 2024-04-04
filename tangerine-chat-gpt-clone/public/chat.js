// Access the user input element
const userInput = document.getElementById('user-input');
// Adjust the height of the input area based on its content
userInput.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

// Initialize conversation history array
let conversationHistory = []; // why can't I just extract chat-container which contains conversation history? why global variable here?

//Creating message blurb in conversation history to chat container
function appendMessage(who, message) {
  // Access the chat container and create a new message element
  const chatContainer = document.getElementById('chat-container');

  const messageDiv = document.createElement('div'); //why react and not html stuff?
  messageDiv.className = 'message';

  const roleSpan = document.createElement('span');
  roleSpan.className = who.toLowerCase();
  roleSpan.textContent = who + ': ';

  const contentSpan = document.createElement('span');
  contentSpan.className = 'message-content';
  contentSpan.textContent = message;

  // Append the role and message to the message div, and the div to the container
  messageDiv.appendChild(roleSpan);
  messageDiv.appendChild(contentSpan);

  chatContainer.appendChild(messageDiv);

  // Auto-scroll to the latest message
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Async function to send a message and get a response. THIS DA BUTTON
async function sendMessage() {
  // Access the user input element and get the value
  const userInput = document.getElementById('user-input');
  const message = userInput.value; //updated, and then sendMessage() called, blank signature 
  userInput.value = ''; //why resetting???
  // Append the user's message to the chat and update the history
  appendMessage('you', message); // gets the message from userInput stored above, so user alr typed?
  //two separate actions, one is to append the message to the chat interface, the other is to update the history, so there is context in the role. 
  conversationHistory.push({ role: 'user', content: message }); //conversationHistory gets passed in

  // Scroll to the latest message
  const chatContainer = document.getElementById('chat-container'); //observation: re-getting every html id p much in every function
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    // Send the message to the Websocket server and await the response
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history: conversationHistory }),
    });
    const data = await response.json();
    // Log the response data for debugging and append the bot's message to the chat
    console.log(data);
    appendMessage('chatbot', data.reply);
    // Update conversation history with the assistant's reply
    conversationHistory.push({ role: 'assistant', content: data.reply });

    // Log the updated conversation history for debugging
    console.log(JSON.stringify(conversationHistory, null, 2));
  } catch (error) {
    // Log any errors in communicating with the server
    console.error('Error communicating with server:', error);
  }
}
