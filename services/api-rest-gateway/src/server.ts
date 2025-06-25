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

const proxyConfigs = [
	// auth
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://localhost:5000" : "http://auth:5000",
		prefix: "/me",
		rewritePrefix: "/me",
		websocket: false,
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://localhost:5000" : "http://auth:5000",
		prefix: "/login",
		rewritePrefix: "/login",
		websocket: false,
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://localhost:5000" : "http://auth:5000",
		prefix: "/signup",
		rewritePrefix: "/signup",
		websocket: false,
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://localhost:5000" : "http://auth:5000",
		prefix: "/avatar",
		rewritePrefix: "",
		websocket: false,
	},
		{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://localhost:5000" : "http://auth:5000",
		prefix: "/uploads/",
		rewritePrefix: "/uploads/",
		websocket: false,
	},

	// live-chat
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "ws://localhost:3003" : "ws://live-chat:3003",
		prefix: "/chat",
		rewritePrefix: "/chat",
		websocket: true,
	},

	// sqlite-db
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL
				? "http://localhost:4000"
				: "http://sqlite-db:4000",
		prefix: "/list-users",
		rewritePrefix: "/list-users",
		websocket: false,
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL
				? "http://localhost:4000"
				: "http://sqlite-db:4000",
		prefix: "/get-user/:id",
		rewritePrefix: "/get-user/:id",
		websocket: false,
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL
				? "http://localhost:4000"
				: "http://sqlite-db:4000",
		prefix: "/top-user",
		rewritePrefix: "/top-user",
		websocket: false,
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL
				? "http://localhost:4000"
				: "http://sqlite-db:4000",
		prefix: "/add-user",
		rewritePrefix: "/add-user",
		websocket: false,
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL
				? "http://localhost:4000"
				: "http://sqlite-db:4000",
		prefix: "/update-score",
		rewritePrefix: "/update-score",
		websocket: false,
	},
];

for (const cfg of proxyConfigs) {
	fastify.register(fastifyHttpProxy, {
		upstream: cfg.upstream,
		prefix: cfg.prefix,
		rewritePrefix: cfg.rewritePrefix,
		websocket: cfg.websocket,
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
