import { FastifyInstance } from "fastify";

export default async function friendsRoutes(fastify: FastifyInstance, opts: any) {
    const db = opts.db;

    fastify.get("/get-friends/:id", async (request, reply) => {
		try {
			const { id } = request.params as { id: string }
			if (!id || isNaN(Number(id))) {
				return reply.status(400).send({ error: "Invalid user ID" });
			}
			const userId = Number(id);
			const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
			if (!user) {
				return reply.status(404).send({ error: "User not found" });
			}

			const stmt = db.prepare(`
			SELECT
				users2.username AS friend_username,
				users2.id AS friend_id
			FROM friends
			JOIN users AS users2 ON users2.id = friends.friend_id
			WHERE friends.user_id = ?
			`);
			const friends = stmt.all(userId);
			return friends || { error: "No friends found" };
		}
		catch (err) {
			console.error("Error in /get-friends:", err);
			return reply.status(500).send({ error: "Internal server error" });
		}
    });

	fastify.post("/add-friend", async (request, reply) => {
		try {
			const userIdStr = request.headers['x-user-id'] as string;
			if (!userIdStr || isNaN(Number(userIdStr))) {
				return reply.status(400).send({ error: "Invalid user ID" });
			}

			const userId = Number(userIdStr);
			const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
			if (!user) {
				return reply.status(404).send({ error: "User not found" });
			}

			const { friendUsername } = request.body as { friendUsername: string };
			const friendRow = db.prepare("SELECT id FROM users WHERE username = ?").get(friendUsername);
			if (!friendRow) {
				return reply.status(404).send({ error: "Friend not found" });
			}
			const friendId = friendRow.id;

			if (friendId === userId) {
				return reply.status(400).send({ error: "Cannot add yourself as a friend" });
			}

			const selectFriendshipStmt = db.prepare(
				"SELECT * FROM friends WHERE user_id = ? AND friend_id = ?",
			);
			const friendship = selectFriendshipStmt.get(userId, friendId);
			if (friendship) {
				return reply.status(400).send({ error: "Friendship already exists" });
			}

			console.log(`Adding friendship: ${userId} -> ${friendId}`);
			const insertFriendshipStmt = db.prepare(
				"INSERT INTO friends (user_id, friend_id) VALUES (?, ?)",
			);
			const result = insertFriendshipStmt.run( userId, friendId);
			return { success: true };
		}
		catch (err) {
			console.error("Error in /add-friend:", err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});


}
