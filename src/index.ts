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

const RedisStore = connectRedis(session);
const redisClient = createClient();

export const loginSession = session({
  name: LOGIN_COOKIE,
  store: new RedisStore({ client: redisClient, disableTouch: true }), // disableTouch - off time-to-alive
  cookie: { secure: true },
  saveUninitialized: false,
  secret: config.secret,
  resave: false,
});

(async () => {
  const serverPort = 8020; // move to .env

  await redisClient.connect().catch((err) => {
    throw err;
  });

  const app = express();
  app.use(cors({ origin: '*', credentials: true }));
  app.use(router);
  app.use(loginSession);

  const server = createServer(app);

  createConnection().then(async (conn) => {
    await conn.runMigrations();
    initAdminUser();
    server.listen(serverPort, () => {
      console.log(`Server started at ${new Date()}`);
    });
  });
})();
