require('dotenv').config();

const getEnv = (key) => {
  const env = process.env[key];
  if (!env) throw new Error(`Couldn't find enviroment variabel: ${key}`);
  return env;
};

const SERVER_CONFIG = {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
};

const JWT_CONFIG = {
  ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY: process.env.REFRESH_TOKEN_KEY,
  AUTH_STRATEGY_NAME: 'forumapi_jwt',
  AUTH_STRATEGY_SCHEME: 'jwt',
  AUTH_STRATEGY_OPTIONS: {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: 3000,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  },
};

module.exports = {
  getEnv,
  SERVER_CONFIG,
  JWT_CONFIG,
};
