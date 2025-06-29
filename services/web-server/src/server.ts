import Fastify from "fastify";
import path from "path";
import fastifyStatic from "@fastify/static";
import { fileURLToPath } from "url";
import fastifyHttpProxy from "@fastify/http-proxy";
import * as dotenv from "dotenv";
import * as fs from "fs";

const dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

enum Runtime {
	LOCAL = "local",
	DOCKER = "docker",
}

const fastify = Fastify({
	logger: true,
	https: {
		key: fs.readFileSync(path.join(dirname, "../certs/key.pem")),
		cert: fs.readFileSync(path.join(dirname, "../certs/cert.pem")),
	},
});

// HTTP Fastify instance (redirects to HTTPS)
const redirectApp = Fastify({ logger: false });
redirectApp.all("*", (request, reply) => {
	const host = request.headers.host?.replace(/:\d+$/, ":443") || "";
	return reply.status(308).redirect(`https://${host}${request.raw.url}`);
});

fastify.register(fastifyStatic, {
	root: path.join(dirname, "..", "public"),
	prefix: "/",
});

fastify.get("/", async (_, reply) => {
	return reply.sendFile("index.html");
});

// redirect to api-rest-gateway
fastify.register(fastifyHttpProxy, {
	upstream:
		process.env.RUNTIME === Runtime.LOCAL
			? "http://127.0.0.1:3000"
			: "http://api-rest-gateway:3000",
	prefix: "/api",
	rewritePrefix: "",
	websocket: true,
});

const start = async () => {
	try {
		await fastify.listen({ port: 443, host: "0.0.0.0" });
		console.log("HTTPS server running at https://127.0.0.1");
		await redirectApp.listen({ port: 80, host: "0.0.0.0" });
		console.log("HTTP redirect server running at http://127.0.0.1");
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
