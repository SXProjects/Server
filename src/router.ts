import express from 'express';
import { getCmd, pushCmd } from './routes/command';
import { login, register } from './routes/user';
import { json } from 'express';
import { loginSession } from './index';
import cors from 'cors';

const router = express.Router();

router.use(json());
router.use(cors({ origin: '*', credentials: true }));

router.post('/command/push', pushCmd);
router.post('/command/get', getCmd);
router.post('/user/login', login);
router.post('/user/register', register);

export { router };
