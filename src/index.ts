import { Server } from 'socket.io';
import { createServer } from 'http';
import { createClient } from 'redis';

import express from 'express';
import cors from 'cors';

const serverPort = 8080; // move to .env

const app = express();
const server = createServer(app);
const redis = createClient();

export const websocket = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'UPDATE', 'DELETE'],
    credentials: true,
  },
});

websocket.on('connection', (socket) => {
  console.log('Unknown system connected.');

  websocket.on('connect_params', (message) => {
    redis.set(message.body.name, socket.id);
  });
});

app.use(cors());

app.get('/', (req, res) => {
  res.send('Test');
});

server.listen(serverPort, () => {
  console.log('server started');
});
