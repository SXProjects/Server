import { Request, Response } from 'express';
import { Command } from '../db/entity/Command';

export async function sendCmd(req: Request, res: Response) {
  console.log(req.body);
  const command = await Command.findOne({
    room: req.body.room,
    receiver: req.body.receiver,
    parameter: req.body.parameter,
  });

  if (command === undefined) {
    await Command.create({
      room: req.body.room,
      receiver: req.body.receiver,
      parameter: req.body.parameter,
    }).save();

    res.status(200).end();
  } else {
    res.status(401).send({ error: 'Данная команда уже на выполнении' });
  }
}

export async function getCmd(req: Request, res: Response) {
  const command = await Command.findOne({
    room: req.body.room,
  });

  if (command === undefined) {
    res.status(200).send({ room: req.body.room });
  } else {
    await Command.remove(command);
    res.status(200).send(JSON.stringify(command));
  }
}
