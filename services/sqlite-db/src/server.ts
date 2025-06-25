import Fastify from "fastify";
import Database from "better-sqlite3";
import * as dotenv from "dotenv";
import { existsSync, mkdirSync } from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

dotenv.config();

enum Runtime {
	LOCAL = "local",
	DOCKER = "docker",
}

const fastify = Fastify({ logger: true });

if (process.env.RUNTIME === Runtime.LOCAL) {
	const dirname = path.dirname(fileURLToPath(import.meta.url));
	// const uploadsDir = path.join(dirname, "data");
	const uploadsDir = "./data";
	if (!existsSync(uploadsDir)) {
		mkdirSync(uploadsDir, { recursive: true });
	}
}

const db = new Database(
	process.env.RUNTIME === Runtime.LOCAL ? "./data/database.db" : "/data/database.db",
);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    top_score INTEGER DEFAULT 0
  )
`);

fastify.get("/list-users", async () => {
	const stmt = db.prepare("SELECT * FROM users");
	return stmt.all();
});

fastify.get("/get-user/:id", async (request) => {
	const { id } = request.params as { id: string };
	const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
	const user = stmt.get(id);
	return user || { error: "User not found" };
});

fastify.get("/top-user", async () => {
	const stmt = db.prepare("SELECT * FROM users ORDER BY top_score DESC LIMIT 1");
	const topUser = stmt.get();
	return topUser || { error: "No users found" };
});

fastify.post("/add-user", async (request) => {
	const { name } = request.body as { name: string };
	const stmt = db.prepare("INSERT INTO users (name) VALUES (?)");
	const result = stmt.run(name);
	return { id: result.lastInsertRowid };
});

fastify.post("/update-score", async (request, reply) => {
	const { userId, score } = request.body as { userId: number; score: number };

	const row = db.prepare("SELECT top_score FROM users WHERE id = ?").get(userId) as
		| { top_score: number }
		| undefined;

	if (!row) {
		reply.status(404);
		return { error: "User not found" };
	}

	const currentTopScore = row.top_score;

	if (score > currentTopScore) {
		const stmt = db.prepare("UPDATE users SET top_score = ? WHERE id = ?");
		stmt.run(score, userId);
		return { top_score: score };
	}

	return { top_score: currentTopScore };
});

fastify.delete("/delete-user/:id", async (request) => {
	const { id } = request.params as { id: string };
	const stmt = db.prepare("DELETE FROM users WHERE id = ?");
	const result = stmt.run(id);
	return { deleted: result.changes > 0 };
});

fastify.listen({ port: 4000, host: "0.0.0.0" }, (err) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
});
