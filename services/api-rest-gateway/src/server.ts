import Fastify from "fastify";
import fastifyHttpProxy from "@fastify/http-proxy";
import * as dotenv from "dotenv";

dotenv.config();

enum Runtime {
	LOCAL = "local",
	DOCKER = "docker",
}

const fastify = Fastify({
	logger: true,
});

const proxyConfigs = [
	// auth
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:5000" : "http://auth:5000",
		prefix: "/me",
		rewritePrefix: "/me",
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:5000" : "http://auth:5000",
		prefix: "/login",
		rewritePrefix: "/login",
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:5000" : "http://auth:5000",
		prefix: "/signup",
		rewritePrefix: "/signup",
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:5000" : "http://auth:5000",
		prefix: "/uploads/",
		rewritePrefix: "/uploads/",
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:5000" : "http://auth:5000",
		prefix: "/2fa/setup",
		rewritePrefix: "/2fa/setup",
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:5000" : "http://auth:5000",
		prefix: "/2fa/verify",
		rewritePrefix: "/2fa/verify",
	},

	// live-chat
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "ws://127.0.0.1:3003" : "ws://live-chat:3003",
		prefix: "/chat",
		rewritePrefix: "/chat",
		websocket: true,
	},
];

for (const cfg of proxyConfigs) {
	fastify.register(fastifyHttpProxy, {
		upstream: cfg.upstream,
		prefix: cfg.prefix,
		rewritePrefix: cfg.rewritePrefix,
		websocket: cfg.websocket ?? false,
	});
}

// For websockets:
fastify.addHook("onRequest", (request, reply, done) => {
	if (request.raw.url?.startsWith("/chat") && request.raw.headers.upgrade === "websocket") {
		fastify.log.info(`WebSocket request for /chat from ${request.ip}`);
	}
	done();
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, function (err, address) {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
});
