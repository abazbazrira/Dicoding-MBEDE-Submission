const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const ClientError = require('../../Commons/exceptions/ClientError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');

const users = require('../../Interfaces/http/api/users');
const authentications = require('../../Interfaces/http/api/authentications');

const threads = require('../../Interfaces/http/api/threads');
const comments = require('../../Interfaces/http/api/comments');

const { SERVER_CONFIG, JWT_CONFIG } = require('../../Commons/helpers');

const createServer = async (container) => {
  const server = Hapi.server({
    host: SERVER_CONFIG.HOST,
    port: SERVER_CONFIG.PORT,
  });

  await server.register([{ plugin: Jwt }]);

  server.auth.strategy(
    JWT_CONFIG.AUTH_STRATEGY_NAME,
    JWT_CONFIG.AUTH_STRATEGY_SCHEME,
    JWT_CONFIG.AUTH_STRATEGY_OPTIONS
  );

  await server.register([
    {
      plugin: users,
      options: { container },
    },
    {
      plugin: authentications,
      options: { container },
    },
    {
      plugin: threads,
      options: { container },
    },
    {
      plugin: comments,
      options: { container },
    },
  ]);

  server.route({
    method: 'GET',
    path: '/',
    handler: () => ({
      value: 'Hello world!',
    }),
  });

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    if (response instanceof Error) {
      // bila response tersebut error, tangani sesuai kebutuhan
      const translatedError = DomainErrorTranslator.translate(response);

      // penanganan client error secara internal.
      if (translatedError instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: translatedError.message,
        });
        newResponse.code(translatedError.statusCode);
        return newResponse;
      }

      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!translatedError.isServer) {
        return h.continue;
      }

      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  return server;
};

module.exports = createServer;
