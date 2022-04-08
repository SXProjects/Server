import * as argon2 from 'argon2';
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { FindOneOptions } from 'typeorm';
import { User } from '../db/entity/User';
import { UserPermission } from '../db/UserPermission';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export async function initAdminUser() {
  const admins = await User.find({ where: { permission: 'ADMIN' } });
  if (admins.length === 0) {
    const hashedPassword = await argon2.hash('admin');

    await User.create({
      name: 'admin',
      password: hashedPassword,
      permission: UserPermission.Admin,
    }).save();
  }
}

export async function saveUserImage(req: Request, res: Response) {
  res.status(200).end();
}

export async function getUserImage(req: Request, res: Response) {
  const loggedInUser = await User.findOne({
    id: req.session.userId,
  });
  if (loggedInUser === undefined) {
    res.status(401).send({
      error: 'Авторизуйтесь и попробуйте еще раз.',
    });
  }
  res
    .status(200)
    .sendFile(
      path.resolve(`${__dirname}/../usersImage/${req.session.userId}.png`)
    );
}

export async function changePassword(req: Request, res: Response) {
  const loggedInUser = await User.findOne({
    id: req.session.userId,
  });

  if (loggedInUser === undefined) {
    res.status(401).send({
      error: 'Авторизуйтесь и попробуйте еще раз.',
    });
  }

  const valid = await argon2.verify(
    loggedInUser!.password as string,
    req.body.oldPassword
  );

  if (!valid) {
    res.status(403).send({
      error: 'Старый пароль неверен, попробуйте еще раз.',
    });
    return;
  }

  loggedInUser!.password = await argon2.hash(req.body.newPassword);
  await loggedInUser!.save();
  res.status(200).end();
}

export async function changeUsername(req: Request, res: Response) {
  const loggedInUser = await User.findOne({
    id: req.session.userId,
  });

  if (loggedInUser !== undefined) {
    res.status(401).send({
      error: 'Авторизуйтесь и попробуйте еще раз.',
    });
  }

  loggedInUser!.name = req.body.newUsername;
  await loggedInUser!.save();
  res.status(200).end();
}

export async function register(req: Request, res: Response) {
  const loggedInUser = await User.findOne({
    id: req.session.userId,
  });

  if (loggedInUser === undefined) {
    res.status(404).send({
      error: 'Авторизуйтесь и попробуйте еще раз.',
    });
  }

  const isUserExist = await User.findOne({
    name: req.body.name,
  });
  let permission = UserPermission.User;

  if (loggedInUser!.permission !== UserPermission.Admin) {
    res.status(403).send({
      error: 'Пожалуйста войдите в аккаунт с правами админа и попробуйте снова',
    });
    return;
  }

  if (isUserExist !== undefined) {
    res.status(409).send({
      error: 'Пользователь с таким именем уже существует.',
    });
    return;
  }

  if (req.body.password!.length < 5) {
    console.log('asdasdsd');
    res.status(409).send({ error: 'Пароль должен быть длиннее пяти символов' });
    return;
  }

  if (req.body.permission === 'ADMIN') {
    permission = UserPermission.Admin;
  }

  const hashedPassword = await argon2.hash(req.body.password);

  await User.create({
    name: req.body.name,
    password: hashedPassword,
    permission: permission,
    lifeTime: 365,
  }).save();

  res.status(200).send();
}

export async function login(req: Request, res: Response) {
  const user = await User.findOne({
    name: req.body.name,
  });
  if (!user) {
    res.status(404).send({
      error: 'Некоррректно введены данные.',
    });
  }

  const valid = await argon2.verify(
    user!.password as string,
    req.body.password
  );

  if (!valid) {
    res.status(403).send({
      error: 'Некоррректно введены данные.',
    });
  }

  req.session.userId = user!.id;
  res.status(200).end();
}

export function logout(req: Request, res: Response) {
  req.session.destroy(() => {
    res.status(204).end();
  });
}

export async function getUser(req: Request, res: Response) {
  if (!req.session.userId) {
    res.status(401).end('Авторизуйтесь и попробуйте еще раз.');
    return;
  }

  const user = await User.findOne({
    id: req.session.userId,
  });
  res.status(200).send(user);
}
