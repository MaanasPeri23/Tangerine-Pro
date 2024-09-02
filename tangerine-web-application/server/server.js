const WebSocket = require('ws');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
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
                sessionFolder = `session_${formattedDate}/${Date.now()}.txt`;

                //Send session folder info to client
                broadcastToAllClients({ action: 'session_folder', folder: sessionFolder} );


            } else if (data.text) {
    
                //Referencing bucket
                //not updating the same file, need to use PUT Request to update the file
                // const params = {
                //     Bucket: process.env.AWS_Bucket_Name,

                // ISSSUE HERE: sure we're using a global variable called sessionFolder, but we're creating a new txt file every time using Date.now()
                //     Key: `${sessionFolder}/${Date.now()}.txt`, //get's current date and parses to the rule format described above
                //     Body: data.text //transcribed text
                // };
                // //Uploading to S3 bucket
                // s3.upload(params, function(err, data) {
                //     if (err) {
                //         console.log('Error uploading to S3:', err);
                //     } else {
                //         //notify all websocket clients that data has been pushed to the S3 bucket
                //         broadcastToAllClients({ action: 'data_pushed'}, sessionFolder);
                //     }
                // });
                console.log("received data", data.text, "in this folder:", data.folder)

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

function broadcastToAllClients(message){
    clients.forEach((client) => {
        client.send(JSON.stringify({...message}));
    })
}

console.log('WebSocket server running at ws://localhost:8080');
