import { Request, Response } from 'express';
import { websocket } from 'src';

export function setCommand(req: Request, res: Response) {
  const from = req.body.from;
  const to = req.body.to;
}
