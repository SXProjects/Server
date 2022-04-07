import { Request, Response } from 'express';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { Data } from 'src/db/entity/Data';

export async function saveParameters(req: Request, res: Response) {
  const data = await Data.findOne({
    room: req.body.room,
  } as FindOneOptions<Data>);

  req.body.parameters.forEach(async (element: any) => {
    if (data === undefined) {
      await Data.create({
        data_type: element.data_type,
        time: new Date(),
        data: element.data.toString(),
        room: req.body.room,
      }).save();
      res.status(200).end();
    }

    data!.data_type = req.body.data_type;
    (data!.time = req.body.time), (data!.data = req.body.data.toString());

    res.status(200).end();
  });
}

export async function getParameters(req: Request, res: Response) {
  const dataForRoom = await Data.find({
    room: req.body.room,
  } as FindManyOptions<Data>);

  if (dataForRoom === undefined) {
    res.status(404).end();
    return;
  }

  res.status(200).send(dataForRoom);
}
