import { FastifyInstance } from "fastify";

type AddUserRequest = {
	username: string;
	password: string;
	name: string;
	nickname: string;
	email: string;
	twofa_secret: string | undefined;
	avatar: string | undefined;
	isGoogleAccount: boolean | undefined;
}

type UpdateUserRequest = {
	nickname: string | undefined;
	avatar: string | undefined;
}

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
		const addUserReq: AddUserRequest = request.body as AddUserRequest;

		try {
			const stmt = db.prepare(
				"INSERT INTO users (username, password, name, nickname, email, twofa_secret, avatar, isGoogleAccount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
			);
			const result = stmt.run(addUserReq.username, addUserReq.password, addUserReq.name, addUserReq.nickname, addUserReq.email, addUserReq.twofa_secret ?? "" , addUserReq.avatar || null, addUserReq.isGoogleAccount ? 1 : 0);
			return { id: result.lastInsertRowid };
		} catch (err: any) {
			reply.status(400);
			return { error: err.message };
		}
	});

	fastify.put("/update-user/:id", async (request, reply) => {
		const { id } = request.params as { id: string };
		const updateUserReq: UpdateUserRequest = request.body as UpdateUserRequest;

		const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
		if (!user) {
			reply.status(404);
			return { error: "User not found" };
		}

		const stmt = db.prepare(
			`UPDATE users SET
                nickname = COALESCE(?, name),
                avatar = COALESCE(?, avatar),
            WHERE id = ?`,
		);

		stmt.run(updateUserReq.nickname, updateUserReq.avatar);

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

	fastify.post("/activate-2fa", async (request, reply) => {
		const { username } = request.body as { username: string };
		
		if (!username) {
			reply.status(400);
			return { error: "Username is required" };
		}

		try {
			const stmt = db.prepare("UPDATE users SET is2FaEnabled = 1 WHERE username = ?");
			const result = stmt.run(username);
			
			if (result.changes === 0) {
				reply.status(404);
				return { error: "User not found" };
			}
			
			return { success: true };
		} catch (err: any) {
			reply.status(400);
			return { error: err.message };
		}
	});

	fastify.post("/set-2fa-secret", async (request, reply) => {
		const { username, secret } = request.body as { username: string; secret: string };
		
		if (!username || !secret) {
			reply.status(400);
			return { error: "Username and secret are required" };
		}

		try {
			// Only set the secret, don't activate 2FA yet
			const stmt = db.prepare("UPDATE users SET twofa_secret = ?, is2FaEnabled = 0 WHERE username = ?");
			const result = stmt.run(secret, username);
			
			if (result.changes === 0) {
				reply.status(404);
				return { error: "User not found" };
			}
			
			return { success: true };
		} catch (err: any) {
			reply.status(400);
			return { error: err.message };
		}
	});


	fastify.put("/add-win/:id", async (request, reply) => {
	const { id } = request.params as { id: string };

	const user = db.prepare("SELECT 1 FROM users WHERE id = ?").get(id);
	if (!user) {
		return reply.status(404).send({ error: "User not found" });
	}

	const stmt = db.prepare(
		"UPDATE users SET wins = wins + 1 WHERE id = ?"
	);
	stmt.run(id);

	return { success: true };
	});

	fastify.put("/add-loss/:id", async (request, reply) => {
	const { id } = request.params as { id: string };

	const user = db.prepare("SELECT 1 FROM users WHERE id = ?").get(id);
	if (!user) {
		return reply.status(404).send({ error: "User not found" });
	}

	const stmt = db.prepare(
		"UPDATE users SET loses = loses + 1 WHERE id = ?"
	);
	stmt.run(id);

	return { success: true };
	});
}
