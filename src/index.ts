import { createServer } from 'http';
import { router } from './router';
import { createConnection } from 'typeorm';
import { createClient } from 'redis';
import { LOGIN_COOKIE, __prod__ } from 'vars';

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import connectRedis from 'connect-redis';
import config from './config';

(async () => {
  const serverPort = 8010; // move to .env

  const RedisStore = connectRedis(session);
  const redisClient = createClient();

  const app = express();
  app.use(cors());
  app.use(router);

  app.use(
    session({
      name: LOGIN_COOKIE,
      store: new RedisStore({ client: redisClient as any, disableTouch: true }), // disableTouch - off time-to-alive
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__, // work only with https
      },
      saveUninitialized: false,
      secret: config.secret,
      resave: false,
    })
  );

  const server = createServer(app);

  createConnection().then(async (conn) => {
    await conn.runMigrations;
    server.listen(serverPort, () => {
      console.log(`Server started at ${new Date()}`);
    });
  });
})();
