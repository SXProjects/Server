import { Request, Response } from 'express';
import { Server } from 'ws';

export function getHistory(req: Request, res: Response) {
  const websocket: WebSocket = req.app.get('websocket');
  websocket.send(JSON.stringify(req.body));
  res.status(200).end();
}
