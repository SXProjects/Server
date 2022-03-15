import express, { NextFunction } from 'express';
import { getCmd, pushCmd, transfer } from './routes/command';
import { login, register } from './routes/user';
import { json } from 'express';
import cors from 'cors';

const router = express.Router();

router.use(json());
router.use(cors({ origin: '*', credentials: true }));

router.post('/command/get', getCmd);
router.post('/user/login', login);
router.post('/user/register', register);
router.post('/command/transfer', transfer);

export { router };
