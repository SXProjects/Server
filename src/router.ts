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
  destination: function (req, file, cb) {
    cb(null, __dirname + '/usersImage');
  },

  filename: function (req: Request, file, cb) {
    cb(null, (req.session.userId as string) + '.png');
  },
});

const upload = multer({ storage });

const router = express.Router();

router.use(json());
router.use(cors({ origin: true, credentials: true }));

router.post('/parameters/send', saveParameters);
router.post('/parameters/get', getParameters);
router.get('/parameters/rooms', getRooms);
router.post('/user/login', login);
router.delete('/user/logout', logout);
router.post('/user/register', register);
router.post('/user/change/password', changePassword);
router.post('/user/change/username', changeUsername);
router.post('/user/image/add', upload.single('userImage'), saveUserImage);
router.get('/user/image/get', getUserImage);
router.get('/user/get', getUser);

export { router };
