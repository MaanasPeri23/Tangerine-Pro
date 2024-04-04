import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk';

const TranscriptDisplay = () => {
  const [transcript, setTranscript] = useState([]);

  useEffect(() => {
    // connecting to server created in server.js
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('React Client connected to WebSocket server');
    };
    
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
    
      if (data.action === 'session_folder' || data.action === 'data_pushed') {
    
        try {
            //AWS S3 bucket configurations
            const awsConfig = {
                accessKeyId: process.env.AWS_Bucket_ID,
                secretAccessKey: process.env.AWS_Secret_Key,
                region: process.env.AWS_Bucket_Region
            };
            AWS.config.update(awsConfig);
            const s3 = new AWS.S3();
            const params = {
                Bucket: process.env.AWS_Bucket_Name,
                Prefix: `${data.folder}/`
            };
          
            //returning only the latest text file to display real-time transcription
            const listObjectsResponse = await s3.listObjectsV2(params).promise();
            const latestObject = listObjectsResponse.Contents[listObjectsResponse.Contents.length - 1];
            const latestObjectKey = latestObject.Key;
            const getObjectResponse = await s3.getObject({ Bucket: params.Bucket, Key: latestObjectKey }).promise();
            const latestTranscript = getObjectResponse.Body.toString('utf-8');

            console.log(latestTranscript)
    
          setTranscript(latestTranscript);
        //   console.log('Combined transcript:', latestTranscript);
          
        } catch (error) {
          console.error('React Client Error fetching data:', error);
        }
      }
    };

    ws.onclose = () => {
      console.log('React Client disconnected from WebSocket server');
    };

    return () => {
      ws.close();
    };
  }, []);
  //wrong place to put the html, because for every websocket connection its reconnecting and calling the html file, the page is essentially being reloaded every time.
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        {/* Render your existing project components */}
        <h1>Transcript Display</h1>
        <div style={{ backgroundColor: 'white', minHeight: '500px', padding: '20px' }}>
          {transcript}
        </div>
      </div>
    </div>
  );
};

export default TranscriptDisplay;