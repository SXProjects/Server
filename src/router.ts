import { Router, Response } from 'express';

export const router = Router();

router.get('/', (res: Response) => {
  res.send('Hello world');
});
