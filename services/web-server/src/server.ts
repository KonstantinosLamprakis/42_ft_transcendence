import Fastify from "fastify";
import path from "path";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import { fileURLToPath } from "url";
import * as fs from "fs";

const dirname = path.dirname(fileURLToPath(import.meta.url));

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
    return reply.redirect(308, `https://${host}${request.raw.url}`);
});

fastify.register(fastifyCors, {
	origin: "*", // Adjust CORS as needed
});

fastify.register(fastifyStatic, {
	root: path.join(dirname, "..", "public"),
	prefix: "/",
});

fastify.get("/", async (_, reply) => {
	return reply.sendFile("index.html");
});

const start = async () => {
	try {
        await fastify.listen({ port: 443, host: "0.0.0.0" });
        console.log("HTTPS server running at https://localhost");
        await redirectApp.listen({ port: 80, host: "0.0.0.0" });
        console.log("HTTP redirect server running at http://localhost");
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
