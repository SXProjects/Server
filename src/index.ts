import { Server } from 'socket.io';
import { createServer } from 'http';
import { createClient } from 'redis';
import { router } from './router';

import express from 'express';
import cors from 'cors';

(async () => {
  const serverPort = 8080; // move to .env

  const redis = createClient();
  const app = express();
  const server = createServer(app);
  await redis.connect();

  const websocket = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST', 'UPDATE', 'DELETE'],
      credentials: true,
    },
  });
  app.use(cors());
  app.use(router);

  websocket.on('connection', (socket) => {
    socket.on('connect_system', (message) => {
      redis.set(message.name, socket.id);
    });

    socket.on('send_cmd', async (message) => {
      console.log(message.to);
      if ((await redis.get(message.to)) !== null) {
        const socket = (await redis.get(message.to)) as string;
        websocket
          .to(socket)
          .emit('receive_cmd', { from: message.from, command: message.body });
      } else if ((await redis.get(message.to)) === null) {
        console.log(`No such recipient exists: ${message.to}`);
      } else if (message.to === '') {
        console.log(`Recipient not declared in message: ${message.from}`);
      }
    });
  });

  server.listen(serverPort, () => {
    console.log(`Server started at ${new Date()}`);
  });
})();
