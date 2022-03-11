import { Router } from 'express';
import { getCmd, pushCmd } from './routes/command';
import { login, register } from './routes/user';
import { json } from 'express';
import { login_session } from './session';
import cors from 'cors';

export const router = Router();

router.use(json());
router.use(cors({ origin: '*', credentials: true }));
router.use(login_session);

router.post('/command/push', pushCmd);
router.post('/command/get', getCmd);
router.post('/user/login', login);
router.post('/user/register', register);
