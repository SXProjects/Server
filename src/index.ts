import { createServer } from 'http';
import { router } from './router';
import { createConnection } from 'typeorm';
import { initAdminUser } from './routes/user';

import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import session from 'express-session';
import config from './config';
import connectRedis from 'connect-redis';
import { createClient } from 'redis';

const app = express();
const server = createServer(app);
const websocket = new WebSocketServer({ server: server });
const RedisStore = connectRedis(session);
const redisClient = createClient({
  port: 6379,
  host: '127.0.0.1',
});

app.use(
  session({
    name: config.LOGIN_COOKIE,
    store: new RedisStore({ client: redisClient as any, disableTouch: true }),
    secret: config.secret,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
      sameSite: 'lax',
    },
    resave: false,
  })
);

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(router);

websocket.on('connection', (ws: WebSocket) => {
  app.set('websocket', ws);
  console.log(`${ws.bufferedAmount} connected to websocket.`);
});

createConnection().then(async (conn) => {
  initAdminUser();
  server.listen(config.port, () => {
    console.log(`Server started at ${new Date()}`);
  });
});
