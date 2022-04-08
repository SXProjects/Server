import { createServer } from 'http';
import { router } from './router';
import { createConnection } from 'typeorm';
import { initAdminUser } from './routes/user';
import { createClient } from 'redis';
import { WebSocketServer, WebSocket } from 'ws';

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import config from './config';
import connectRedis from 'connect-redis';
import path from 'path';

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

app.use(express.static(path.join(__dirname, '/usersImage')));
app.use(cors({ origin: true, credentials: true }));
app.use(router);

websocket.on('connection', (ws: WebSocket) => {
  app.set('websocket', ws);
  console.log(`Someone connected to websocket.`);
});

createConnection().then(async (conn) => {
  initAdminUser();
  server.listen(config.port, () => {
    console.log(`Server started at ${new Date()}`);
  });
});
