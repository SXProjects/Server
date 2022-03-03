import { createServer } from 'http';
import { router } from './router';
import { createConnection } from 'typeorm';

import express from 'express';
import cors from 'cors';

function initServer() {
  const serverPort = 8010; // move to .env
  const app = express();
  app.use(cors());
  app.use(router);

  const server = createServer(app);

  createConnection().then(async (conn) => {
    await conn.runMigrations;
    server.listen(serverPort, () => {
      console.log(`Server started at ${new Date()}`);
    });
  });
}

initServer();
