import { Command } from '../db/entity/Command';
import { Request, Response } from 'express';

export async function pushCmd(req: Request, res: Response) {
  checkCommandExist(req.body);
  const command = await Command.create({
    device_id: req.body.device_id,
    time: new Date(req.body.time),
    command_name: req.body.command_name,
    first_command_data: req.body.first_command_data as string,
    second_command_data: (req.body.second_command_data as string) || '',
  }).save();

  if (command.device_id === null) {
    res.status(400).end();
  }

  res.status(200).end();
}

export async function getCmd(req: Request, res: Response) {
  const commands = await Command.find({
    where: { device_id: req.body.device_id },
  });

  if (commands.length !== 0) {
    commands!.forEach(async (element) => {
      await Command.remove(element as Command);
    });
    res.status(200).send(commands);
  } else {
    res.status(404).end();
  }
}

async function checkCommandExist(newCommand: any) {
  const command = await Command.findOne({
    where: {
      device_id: newCommand.device_id,
      command_name: newCommand.command_name,
    },
  });

  if (command?.device_id != null) {
    await Command.remove(command as Command);
  }
}
