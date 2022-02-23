import { Server } from 'socket.io';
import { createServer } from 'http';
import { createClient } from 'redis';

import express from 'express';
import cors from 'cors';
import { router } from './router';

(async () => {
  const serverPort = 8080; // move to .env

  const redis = createClient();
  const app = express();
  const server = createServer(app);

  app.use(cors());
  app.use(router);

  await redis.connect();
  redis.on('error', (err) => {
    console.log('Error ' + err);
  });

  const websocket = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST', 'UPDATE', 'DELETE'],
      credentials: true,
    },
  });

  websocket.on('connection', (socket) => {
    socket.on('connect_system', (message) => {
      redis.set(message.name, socket.id);
    });

    socket.on('send_cmd', async (message) => {
      if ((await redis.get(message.to)) !== null) {
        const socket = (await redis.get(message.to)) as string;
        websocket
          .to(socket)
          .emit('receive_cmd', { from: message.from, command: message.body });
      }
    });
  });

  server.listen(serverPort, () => {
    console.log('server started');
  });
})();
