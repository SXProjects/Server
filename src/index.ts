import { createServer } from 'http';
import { router } from './router';
import { createConnection } from 'typeorm';
import { initAdminUser } from './routes/user';
import { login_session } from './session';
import { redisClient } from './session';

import express from 'express';
import cors from 'cors';

(async () => {
  const serverPort = 8020; // move to .env

  const app = express();
  app.use(cors({ origin: '*', credentials: true }));
  app.use(login_session);
  app.use(router);

  const server = createServer(app);

  createConnection().then(async (conn) => {
    await conn.runMigrations();
    await redisClient.connect();
    initAdminUser();
    server.listen(serverPort, () => {
      console.log(`Server started at ${new Date()}`);
    });
  });
})();
