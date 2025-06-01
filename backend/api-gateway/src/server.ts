import Fastify from 'fastify';
import path from 'path';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors, {
  origin: '*', // Adjust CORS as needed
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/public/',
});

fastify.get('/', async (request, reply) => {
  // Simple SSR: send HTML with embedded minimal frontend
  reply.type('text/html').send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Pong Tournament - Hello World</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.2.4/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-900 text-white flex items-center justify-center h-screen">
      <h1 class="text-4xl font-bold">Hello World from Pong Tournament API Gateway!</h1>
    </body>
    </html>
  `);
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('API Gateway running at http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
