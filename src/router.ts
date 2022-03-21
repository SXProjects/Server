import express, { NextFunction } from 'express';
import { getCmd, saveCmd, sendCmd } from './routes/command';
import { sendData } from './routes/data';
import { getUser, login, register } from './routes/user';
import { json } from 'express';
import cors from 'cors';

const router = express.Router();

router.use(json());
router.use(cors({ origin: 'http://localhost:3000', credentials: true }));

router.post('/data/send', sendData);
router.post('/command/send', sendCmd);
router.post('/command/get', getCmd);
router.post('/user/login', login);
router.post('/user/register', register);
router.get('/user/get', getUser);

export { router };
