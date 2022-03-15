import { Request, Response } from 'express';
import { Server } from 'ws';

export function getHistory(req: Request, res: Response) {
  const websocket: Server = req.app.get('websocket');
  websocket.emit('history', req.body);
  res.status(200).end();
}
