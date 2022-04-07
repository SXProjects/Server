import { saveCmd } from './command';
import { Request, Response } from 'express';
import { Server, WebSocket } from 'ws';

export async function sendData(req: Request, res: Response) {
  const websocket: WebSocket = req.app.get('websocket');
  websocket.send(JSON.stringify(req.body));
  websocket.on('message', (msg: Buffer) => {
    const msgJson: any[] = JSON.parse(msg.toString());
    msgJson.forEach((element) => {
      console.log(element);
      saveCmd(element);
    });
  });
  res.status(200).end();
}

export function printError(req: Request, res: Response) {
  console.log(req.body);
  res.status(200).end();
}
