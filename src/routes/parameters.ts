import { Request, Response } from 'express';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { Data } from '../db/entity/Data';

export async function saveParameters(req: Request, res: Response) {
  console.log(req.body);

  req.body.parameters.forEach(async (element: any) => {
    const data = await Data.findOne({
      room: req.body.room,
      data_type: element.data_type,
    });

    if (data === undefined) {
      await Data.create({
        data_type: element.data_type,
        time: new Date(),
        data: element.data as string,
        room: req.body.room,
      }).save();
    } else {
      data!.data_type = element.data_type;
      data!.time = new Date();
      data!.data = element.data as string;
      data!.save();
    }
  });

  res.status(200).end();
}

export async function getParameters(req: Request, res: Response) {
  console.log(req.body);
  const dataForRoom = await Data.find({
    room: req.body.room,
  });

  console.log(dataForRoom);

  if (dataForRoom === undefined) {
    res.status(404).end();
    return;
  }

  res.status(200).send(dataForRoom);
}

export async function getRooms(req: Request, res: Response) {
  const rooms = await Data.find();
  let roomNames: string[] = [];

  for (let i = 0; i < rooms.length; i++) {
    roomNames.push(rooms[i].room);
  }

  roomNames = [...new Set(roomNames)];

  if (roomNames.length !== 0) {
    res.status(200).send(JSON.stringify(roomNames));
  } else {
    res.status(404).send(JSON.stringify({ error: 'Комнат не найдено.' }));
  }
}
