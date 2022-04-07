import { Command } from '../db/entity/Command';
import { Request, Response } from 'express';
import { WebSocket } from 'ws';
import { Devices } from '../db/entity/Devices';

export async function saveCmd(commandJson: any) {
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
    const devices = await Devices.findOne({ physicalId: request.unique_id });

    if (request.device_type === undefined || request.device_type.length === 0) {
      res.status(400).send({
        error: 'Нет информации о типе подключенных к системе устройств.',
      });
      return;
    }

    if (devices !== undefined) {
      if (devices!.version !== request.version) {
        devices!.version = request.version;
        devices!.save();

        const command = {
          command_name: 'device_config_info',
          device_id: devices!.virtualIds,
        };
        websocket.send(JSON.stringify(command));
        websocket.on('message', (msgRaw: Buffer) => {
          const msgParsed: any[] = JSON.parse(msgRaw.toString());
          res.status(200).send(msgParsed);
        });
        return;
      } else if (devices!.version === request.version) {
        res.status(409).send({ error: 'Устройство уже добавлено в систему.' });
      }
    }

    let commands: Object[] = [];
    let virtualDeviceIds: number[] = [];

    for (let i = 0; i < request.device_type.length; i++) {
      const command = {
        command_name: 'add_device',
        location: `home/${request.unique_id}/${request.device_type[0].type}`,
        device_type: request.device_type[0].type,
        work_mode: request.device_type[0].work_mode,
      };

      commands.push(command);
    }

    websocket.send(JSON.stringify(commands));
    websocket.on('message', (msgRaw: Buffer) => {
      const msgParsed: any[] = JSON.parse(msgRaw.toString());

      for (let i = 0; i < msgParsed.length; i++) {
        console.log(`Number inter of response ${i}`);
        virtualDeviceIds.push(msgParsed[0].device_id);
      }
      console.log('Iter end.');
    });

    await Devices.create({
      version: request.version,
      physicalId: request.unique_id,
      virtualIds: virtualDeviceIds,
    }).save();

    websocket.send(
      JSON.stringify({
        command_name: 'device_config_info',
        device_id: virtualDeviceIds,
      })
    );
    console.log('device config sent');

    websocket.on('message', (msgRaw: Buffer) => {
      const msgParsed: any[] = JSON.parse(msgRaw.toString());
      res.status(200).send(JSON.stringify(msgParsed));
    });
  } else {
    res.status(400).end();
    return;
  }

  if (request.command_name === 'wakeup') {
    const physical = await Devices.findOne({ physicalId: request.unique_id }); // get row with virtualIds and version via physicalId

    if (physical === undefined) {
      res.status(404).send({
        error: 'Устройство не найдено.',
      });
      return;
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
    return;
  }
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
