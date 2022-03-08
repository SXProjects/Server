import * as argon2 from 'argon2';
import { Request, Response } from 'express';
import { Session } from 'express-session';
import { User } from 'src/db/entity/User';

declare module 'express-session' {
  // used declaration merging as said in github @types/express-session
  export interface SessionData {
    userId: number;
  }
}

export async function register(req: Request, res: Response) {
  const userData = req.body;

  if (userData.password.length > 5) {
    res
      .status(409)
      .end({ error: 'Password length should be greater than five.' });
  }

  const hashedPassword = await argon2.hash(userData.password);
  const user = await User.create({
    name: userData.name,
    password: hashedPassword,
  }).save();

  req.session.userId = user.id;

  res.status(200).end();
}
