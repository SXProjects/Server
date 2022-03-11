import { Command } from '../db/entity/Command';
import { Request, Response } from 'express';

export async function pushCmd(req: Request, res: Response) {
  const command = await Command.create({
    from: req.body.from,
    to: req.body.to,
    body: req.body.body,
  }).save();

  if (command.id != null) {
    res.status(200).end();
  } else {
    res.status(400).end();
  }
}

export async function getCmd(req: Request, res: Response) {
  const commands = await Command.find({ where: { to: req.body.system_name } });

  if (commands.length != 0) {
    res.status(200).send(commands);
  } else {
    res.status(404).end();
  }
}
