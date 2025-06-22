import Fastify from "fastify";
import fastifyHttpProxy from "@fastify/http-proxy";

const fastify = Fastify({ logger: true });


// For HTTP should be something like this:
// fastify.register(fastifyHttpProxy, {
// 	upstream: "http://live-chat:3003", // Use Docker service name or localhost:3003 if running locally
// 	prefix: "/chat-api", // All requests to /chat-api/* will be proxied
// 	rewritePrefix: "", // Remove /chat-api prefix when forwarding
// });
// Or
// fastify.get('/chat', async (request, reply) => {
//     const res = await fastify.inject({
//         method: 'GET',
//         url: 'http://live-chat:3003/some-endpoint'
//     });
//     reply.status(res.statusCode).send(res.body);
// });

// For websockets:
fastify.register(fastifyHttpProxy, {
	// upstream: "ws://localhost:3003", // use this for local development
	upstream: "ws://live-chat:3003", // use this for docker
	prefix: "/chat",
	websocket: true,
	rewritePrefix: "/chat",
});

// Example: health check endpoint for the gateway itself
fastify.get("/", (request, reply) => {
	reply.send({ hello: "world" });
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, function (err, address) {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
});
