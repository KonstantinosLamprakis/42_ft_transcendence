import Fastify from "fastify";
import path from "path";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors, {
	origin: "*", // Adjust CORS as needed
});

fastify.register(fastifyStatic, {
	root: path.join(__dirname, "..", "public"),
	prefix: "/",
});

fastify.get("/", async (_, reply) => {
	return reply.sendFile("index.html");
});

const start = async () => {
	try {
		await fastify.listen({ port: 8080, host: "0.0.0.0" });
		console.log("API Gateway running at http://localhost:8080");
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
