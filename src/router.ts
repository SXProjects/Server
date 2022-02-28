import { RedisClientType } from '@node-redis/client';
import { Router, Response, Request } from 'express';
import { Server } from 'socket.io';

export const router = Router();

router.post('/socket', async (req: Request, res: Response) => {
  const websocket: Server = req.app.get('socket.io');
  const redis: RedisClientType = req.app.get('redis');
  await redis.connect();

  websocket.on('connection', (socket) => {
    console.log('connected');

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
});
