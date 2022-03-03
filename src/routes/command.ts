import { Command } from '../db/entity/Command';
import { Request, Response } from 'express';

export async function pushCmd(req: Request, res: Response) {
  const receivedCommand = req.body;
  const command = await Command.create({
    from: receivedCommand.from,
    to: receivedCommand.to,
    body: receivedCommand.body,
  }).save();

  if (command.id != null) {
    res.status(200).end();
  } else {
    res.status(400).end();
  }
}

export async function getCmd(req: Request, res: Response) {
  const receivedName = req.body.system_name;
  const commands = await Command.find({ where: { to: receivedName } });
  console.log(commands);

  if (commands.length != 0) {
    res.status(200).json(commands);
  } else {
    res.status(404).end();
  }
}
