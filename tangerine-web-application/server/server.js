const WebSocket = require('ws');
const AWS = require('aws-sdk');
import dotenv from 'dotenv';
dotenv.config();

const wss = new WebSocket.Server({ port: 8080 });
AWS.config.update({
    accessKeyId: process.env.AWS_Bucket_ID,
    secretAccessKey: process.env.AWS_Secret_Key,
    region: process.env.AWS_Bucket_Region
  });

const s3 = new AWS.S3();
const clients = new Set();

//pulling all data is too strenuous on the server, so we need to pull the last bit of data every time an event happens. And an event happens when client sends new data to s3 bucket 

wss.on('connection', function connection(ws) {
    clients.add(ws);
    console.log('A new client connected');
    let sessionFolder = '';

    ws.on('message', function incoming(message) {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', message);

            if (data.action === 'start_session') {
                const currentDate = new Date();
                const options = {
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                };
                //formatting session folder as January 19th, 3:30 PM format
                const formattedDate = currentDate.toLocaleString('en-US', options).replace(',', '').replace(/:/g, '-'); 
                // replace colons with hyphens and remove comma after the day
                sessionFolder = `session_${formattedDate}`;
                // console.log('Started new session:', sessionFolder);

                //sending session folder to react frontend to pull specific bucket source from
                broadcastToAllClients({ action: 'session_folder', folder: sessionFolder }, sessionFolder);
            } else if (data.text) {
    
                //Referencing bucket
                const params = {
                    Bucket: process.env.AWS_Bucket_Name,
                    Key: `${sessionFolder}/${Date.now()}.txt`, //get's current date and parses to the rule format described above
                    Body: data.text //transcribed text
                };
                //Uploading to S3 bucket
                s3.upload(params, function(err, data) {
                    if (err) {
                        console.log('Error uploading to S3:', err);
                    } else {
                        //notify all websocket clients that data has been pushed to the S3 bucket
                        broadcastToAllClients({ action: 'data_pushed'}, sessionFolder);
                    }
                });

            }
            
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    });

    ws.on('close', function close() {
        console.log('Client disconnected');
        sessionFolder = '' // reseting session folder
        clients.delete(ws);
    });
});

function broadcastToAllClients(message, sessionFolder){
    clients.forEach((client) => {
        client.send(JSON.stringify({...message, folder: sessionFolder}));
    })
}

console.log('WebSocket server running at ws://localhost:8080');
