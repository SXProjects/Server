import { createServer } from 'http';
import { router } from './router';
import { createConnection } from 'typeorm';
import { initAdminUser } from './routes/user';

import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { pushCmd } from './routes/command';
import session from 'express-session';
import config from './config';
import { LOGIN_COOKIE } from '../vars';

const serverPort = 8080; // move to .env
const app = express();
const server = createServer(app);
const websocket = new WebSocketServer({ server: server });

app.use(
  session({
    name: LOGIN_COOKIE,
    secret: config.secret,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

app.use(cors({ origin: '*', credentials: true }));
app.use(router);

websocket.on('connection', (ws: WebSocket) => {
  app.set('websocket', ws);
  console.log('Connected');

  ws.on('message', (msg: any) => {
    const msgJson = JSON.parse(msg);
    if (msgJson.command_name === 'transmit_data') {
      pushCmd(msg);
    }

    if (msgJson.command_name === 'history') {
      console.log(msgJson); // send data to client
    }
  });
});

createConnection().then(async (conn) => {
  await conn.runMigrations();
  initAdminUser();
  server.listen(serverPort, () => {
    console.log(`Server started at ${new Date()}`);
  });
});
