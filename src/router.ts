import { Router } from 'express';
import { getCmd, pushCmd } from './routes/command';
import { json } from 'express';

export const router = Router();
router.use(json());

router.post('/command/push', pushCmd);
router.post('/command/get', getCmd);
