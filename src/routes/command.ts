import { Command } from '../db/entity/Command';
import { Request, Response } from 'express';
import { Server } from 'socket.io';

export async function pushCmd(commandJson: any) {
  checkCommandExist(commandJson);
  await Command.create({
    device_id: commandJson.device_id,
    time: new Date(commandJson.time),
    command_name: commandJson.command_name,
    first_command_data: commandJson.first_command_data as string,
    second_command_data: (commandJson.second_command_data as string) || '',
  }).save();
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

export function transfer(req: Request, res: Response) {
  const websocket: Server = req.app.get('websocket');
  websocket.emit('transfer', req.body);
  res.status(200).end();
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
