// server.js
const fastify = require('fastify')({ logger: true });

// Catch-all route: matches any method and any URL
fastify.all('*', async (request, reply) => {
  reply.code(200).send('OK');
});

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info(`Server listening on http://localhost:3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();