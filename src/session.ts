import connectRedis from 'connect-redis';
import session from 'express-session';
import config from '../src/config';

import { createClient } from 'redis';
import { LOGIN_COOKIE, __prod__ } from '../vars';

export const redisClient = createClient();
const RedisStore = connectRedis(session);

export const login_session = session({
  name: LOGIN_COOKIE,
  store: new RedisStore({ client: redisClient as any, disableTouch: true }), // disableTouch - off time-to-alive
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
    httpOnly: true,
    sameSite: 'lax', // csrf
    secure: __prod__, // work only with https
  } as { secure: boolean },
  saveUninitialized: true,
  secret: config.secret,
  resave: false,
});
