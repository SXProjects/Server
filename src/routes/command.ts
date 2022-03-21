import { Command } from '../db/entity/Command';
import { Request, Response } from 'express';
import { WebSocket } from 'ws';

export async function saveCmd(commandJson: any) {
  checkCommandExist(commandJson);
  await Command.create({
    device_id: commandJson.device_id,
    time: new Date(commandJson.time),
    command_name: commandJson.command_name,
    data: commandJson.data,
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
    res.status(200).send(JSON.stringify(commands));
  } else {
    res.status(404).end();
  }
}

export async function sendCmd(req: Request, res: Response) {
  const websocket: WebSocket = req.app.get('websocket');
  websocket.send(JSON.stringify(req.body));
  let response = {};
  await websocket.on('message', (msg: Buffer) => {
    const msgJson: any[] = JSON.parse(msg.toString());
    msgJson.forEach((element) => {
      response = element;
    });
  });

  if (!JSON.parse(JSON.stringify(response)).hasOwnProperty('error')) {
    res.status(200).send(JSON.stringify(response));
  } else {
    res.status(400).send(JSON.stringify(response));
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
