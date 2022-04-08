import express from 'express';
import cors from 'cors';
import multer from 'multer';

import { Request } from 'express';
import { getParameters, getRooms, saveParameters } from './routes/parameters';
import {
  changePassword,
  changeUsername,
  getUser,
  getUserImage,
  login,
  logout,
  register,
  saveUserImage,
} from './routes/user';
import { json } from 'express';

const storage = multer.diskStorage({
  destination: function (req: Request, file, cb) {
    cb(null, __dirname + '/usersImage');
  },

  filename: function (req: Request, file, cb) {
    cb(null, file.originalname + '.png');
  },
});

const upload = multer({ storage });

const router = express.Router();

router.use(json());
router.use(cors({ origin: true, credentials: true }));

router.post('/parameters/send', saveParameters);
router.get('/parameters/get', getParameters);
router.get('/parameters/rooms', getRooms);
router.post('/user/login', login);
router.post('/user/logout', logout);
router.post('/user/register', register);
router.post('/user/change/password', changePassword);
router.post('/user/change/username', changeUsername);
router.post('/user/image/add', upload.single('userImage'), saveUserImage);
router.get('/user/image/get', getUserImage);
router.post('/user/get', getUser);

export { router };
