import express from 'express';
import { getCmd, sendCmd } from './routes/command';
import { sendData } from './routes/data';
import {
  changePassword,
  changeUsername,
  getUser,
  login,
  register,
} from './routes/user';
import { json } from 'express';
import cors from 'cors';

const router = express.Router();

router.use(json());
router.use(cors({ origin: true, credentials: true }));

router.post('/data/send', sendData);
router.post('/command/send', sendCmd);
router.post('/command/get', getCmd);
router.post('/user/login', login);
router.post('/user/register', register);
router.post('/user/change/password', changePassword);
router.post('/user/change/username', changeUsername);
router.get('/user/get', getUser);

export { router };
