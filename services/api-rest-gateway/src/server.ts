import Fastify from "fastify";
import fastifyHttpProxy from "@fastify/http-proxy";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

dotenv.config();

enum Runtime {
	LOCAL = "local",
	DOCKER = "docker",
}

const dirname = path.dirname(fileURLToPath(import.meta.url));

const fastify = Fastify({
	logger: true,
	https: {
		key: fs.readFileSync(path.join(dirname, "../certs/key.pem")),
		cert: fs.readFileSync(path.join(dirname, "../certs/cert.pem")),
	},
});

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
fastify.addHook("onRequest", (request, reply, done) => {
	if (request.raw.url?.startsWith("/chat") && request.raw.headers.upgrade === "websocket") {
		fastify.log.info(`WebSocket request for /chat from ${request.ip}`);
	}
	done();
});

fastify.register(fastifyHttpProxy, {
	// depending on the env variable we use different URL when running locally or in Docker. If env doesn't exists, we assume it's running in Docker
	upstream: process.env.RUNTIME === Runtime.LOCAL ? "ws://localhost:3003" : "ws://live-chat:3003", // we dont need wss as this is done on docker internal network
	prefix: "/chat",
	websocket: true,
	rewritePrefix: "/chat",
});

// Example: health check endpoint for the gateway itself
fastify.get("/", (request, reply) => {
	console.log(process.env.STAGE);
	reply.send({ hello: "world" });
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, function (err, address) {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
});
