import * as argon2 from 'argon2';
import { Request, Response } from 'express';
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

export async function register(req: Request, res: Response) {
  const loggedInUser = await User.findOne({ id: req.session.userId });

  if (loggedInUser !== null) {
    if (loggedInUser!.permission !== UserPermission.Admin) {
      res.status(403).send({
        error:
          'Пожалуйста войдите в аккаунт с правами админа и попробуйте снова',
      });
      return;
    }
    const newUserData = req.body;

    if (newUserData.password!.length > 5) {
      res
        .status(409)
        .send({ error: 'Password length should be greater than five.' });
    }

    const hashedPassword = await argon2.hash(newUserData.password);
    await User.create({
      name: newUserData.name,
      password: hashedPassword,
      permission: newUserData.permission,
      lifeTime: newUserData.lifeTime,
    }).save();

    res.status(200).end();
  }
}

export async function login(req: Request, res: Response) {
  const user = await User.findOne({ name: req.body.name });
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

export async function getUser(req: Request, res: Response) {
  if (!req.session.userId) {
    res.status(404).end('Please, login first.');
  }

  const user = await User.findOne({ id: req.session.userId });
  res.status(200).send(user);
}
