import Fastify from "fastify";
import Database from "better-sqlite3";
import * as dotenv from "dotenv";
import { existsSync, mkdirSync, readFileSync } from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import usersRoutes from "./routes/users.js";
import matchesRoutes from "./routes/matches.js";
import friendsRoutes from "./routes/friends.js";

dotenv.config();
const dirname = path.dirname(fileURLToPath(import.meta.url));

enum Runtime {
	LOCAL = "local",
	DOCKER = "docker",
}

const fastify = Fastify({logger: true});

if (process.env.RUNTIME === Runtime.LOCAL) {
	const uploadsDir = "./data";
	if (!existsSync(uploadsDir)) {
		mkdirSync(uploadsDir, { recursive: true });
	}
}

const db = new Database(
	process.env.RUNTIME === Runtime.LOCAL ? "./data/database.db" : "/data/database.db",
);

const schema = readFileSync(path.join(dirname, "..", "schema.sql"), "utf-8");
db.exec(schema);

fastify.register(usersRoutes, { db });
fastify.register(matchesRoutes, { db });
fastify.register(friendsRoutes, { db });

fastify.listen({ port: 4000, host: "0.0.0.0" }, (err) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
});
