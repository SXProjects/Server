import { Command } from '../db/entity/Command';
import { Request, Response } from 'express';
import { WebSocket } from 'ws';
import { Devices } from '../db/entity/Devices';

async function compileDevices(
  physicalDeviceId: number,
  virtualDeviceTypes: Object[],
  version: number,
  websocketConnection: WebSocket
) {
  let virtualDeviceIds: number[] = [];

  virtualDeviceTypes.forEach(async (element: any) => {
    console.log(element);
    const command = {
      command_name: 'add_device',
      location: `home/${physicalDeviceId}/${element.type}`,
      device_type: element.type,
      work_mode: element.work_mode,
    };
    websocketConnection.send(JSON.stringify(command));
  });

  websocketConnection.on('message', (msgRaw: Buffer) => {
    const msgParsed: any[] = JSON.parse(msgRaw.toString());
    virtualDeviceIds.push(msgParsed[0].device_id);
  });

  await Devices.create({
    version: version,
    physicalId: physicalDeviceId,
    virtualIds: virtualDeviceIds,
  }).save();
}

export async function saveCmd(commandJson: any) {
  console.log('commandJSOn');
  console.log(commandJson);
  console.log(JSON.stringify(commandJson.data));
  checkCommandExist(commandJson);
  await Command.create({
    device_id: commandJson.device_id,
    time: new Date(commandJson.time),
    command_name: commandJson.command_name,
    data: JSON.parse(JSON.stringify(commandJson.data)),
  }).save();
}

export async function getCmd(req: Request, res: Response) {
  const request = JSON.parse(JSON.stringify(req.body));
  const websocket: WebSocket = req.app.get('websocket');

  if (request.command_name === 'configure') {
    compileDevices(
      request.unique_id,
      request.device_type,
      request.version,
      websocket
    );
    res.status(200).end();
    return;
  }

  const physical = await Devices.findOne({ physicalId: request.unique_id }); // get row with virtualIds and version via physicalId

  if (physical === undefined) {
    res.status(404).send({
      error: 'Устройство не найдено.',
    });
    return;
  }

  if (physical!.version !== request.version) {
    const command = {
      command_name: 'device_config_info',
      device_id: physical.virtualIds,
    };
    websocket.send(JSON.stringify(command));
    websocket.on('message', (msgRaw: Buffer) => {
      const msgParsed: any[] = JSON.parse(msgRaw.toString());
      res.status(200).send(msgParsed);
    });
  }

  const commands: Command[] = [];

  for (let i = 0; i < physical.virtualIds.length; i++) {
    const commandsForCurrentDevice = await Command.find({
      where: { device_id: physical.virtualIds[i] },
    });

    for (let i = 0; i < commandsForCurrentDevice.length; i++) {
      commands.push(commandsForCurrentDevice[i]);
    }
  }

  res.status(200).send(JSON.stringify(commands));
}

export async function sendCmd(req: Request, res: Response) {
  const websocket: WebSocket = req.app.get('websocket');
  websocket.send(JSON.stringify(req.body));
  await websocket.on('message', (msgRaw: Buffer) => {
    const msgParsed: any[] = JSON.parse(msgRaw.toString());
    if (!JSON.parse(JSON.stringify(msgParsed)).hasOwnProperty('error')) {
      res.status(200).end(JSON.stringify(msgParsed));
    } else {
      res.status(400).end(JSON.stringify(msgParsed));
    }
  });
}

async function checkCommandExist(newCommand: any) {
  const command = await Command.findOne({
    where: {
      device_id: newCommand.device_id,
      command_name: newCommand.command_name,
    },
  });

  if (command !== undefined) {
    await Command.remove(command as Command);
  }
}
