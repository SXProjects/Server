import { createServer } from 'http';
import { router } from './router';
import { createConnection } from 'typeorm';
import { initAdminUser } from './routes/user';
import { createClient } from 'redis';
import { LOGIN_COOKIE } from '../vars';

import config from './config';
import session from 'express-session';
import connectRedis from 'connect-redis';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { pushCmd } from './routes/command';

const RedisStore = connectRedis(session);
const redisClient = createClient();

const serverPort = 8020; // move to .env
const app = express();
const server = createServer(app);
const websocket = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'UPDATE', 'DELETE'],
    credentials: true,
  },
});

export const loginSession = session({
  name: LOGIN_COOKIE,
  store: new RedisStore({ client: redisClient, disableTouch: true }), // disableTouch - off time-to-alive
  cookie: { secure: true },
  saveUninitialized: false,
  secret: config.secret,
  resave: false,
});

app.set('websocket', websocket);
app.use(cors({ origin: '*', credentials: true }));
app.use(router);
app.use(loginSession);

websocket.on('connection', (socket) => {
  socket.on('receive', (socket) => {
    pushCmd(socket);
  });
});

createConnection().then(async (conn) => {
  await conn.runMigrations();
  await redisClient.connect().catch((err) => {
    throw err;
  });
  initAdminUser();
  server.listen(serverPort, () => {
    console.log(`Server started at ${new Date()}`);
  });
});
