import { FastifyInstance } from "fastify";

export default async function usersRoutes(fastify: FastifyInstance, opts: any) {
	const db = opts.db;

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

	fastify.post("/add-user", async (request, reply) => {
		const { username, password, name, avatar } = request.body as {
			username: string;
			password: string;
			name: string;
			avatar?: string; // path to avatar image
		};

		try {
			const stmt = db.prepare(
				"INSERT INTO users (username, password, name, avatar) VALUES (?, ?, ?, ?)",
			);
			const result = stmt.run(username, password, name, avatar || null);
			return { id: result.lastInsertRowid };
		} catch (err: any) {
			reply.status(400);
			return { error: err.message };
		}
	});

	fastify.put("/update-user/:id", async (request, reply) => {
		const { id } = request.params as { id: string };
		const { username, password, name, avatar, wins, loses } = request.body as {
			username?: string;
			password?: string;
			name?: string;
			avatar?: string;
			wins?: number;
			loses?: number;
		};

		const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
		if (!user) {
			reply.status(404);
			return { error: "User not found" };
		}

		const stmt = db.prepare(
			`UPDATE users SET
                username = COALESCE(?, username),
                password = COALESCE(?, password),
                name = COALESCE(?, name),
                avatar = COALESCE(?, avatar),
                wins = COALESCE(?, wins),
                loses = COALESCE(?, loses)
            WHERE id = ?`,
		);

		stmt.run(username, password, name, avatar, wins, loses, id);

		return { success: true };
	});

	fastify.delete("/delete-user/:id", async (request) => {
		const { id } = request.params as { id: string };
		const stmt = db.prepare("DELETE FROM users WHERE id = ?");
		const result = stmt.run(id);
		return { deleted: result.changes > 0 };
	});

	fastify.get("/get-user-by-username/:username", async (request) => {
		const { username } = request.params as { username: string };
		const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
		const user = stmt.get(username);
		return user || { error: "User not found" };
	});

	fastify.post("/set-2fa-secret", async (request, reply) => {
		const { username, secret } = request.body as { username: string; secret: string };
		const stmt = db.prepare("UPDATE users SET twofa_secret = ? WHERE username = ?");
		stmt.run(secret, username);
		reply.send({ success: true });
	});
}
