import { FastifyInstance } from "fastify";

export default async function matchesRoutes(fastify: FastifyInstance, opts: any) {
    const db = opts.db;

    fastify.get("/get-user-matches/:id", async (request) => {
        const { id } = request.params as { id: string };

		const stmt = db.prepare(`
		WITH user_matches AS (
		SELECT
			matches.id,
			matches.user1_score,
			matches.user2_score,
			matches.winner_id,
			matches.match_date,
			CASE
			WHEN matches.user1_id = ? THEN matches.user2_id
			ELSE                          matches.user1_id
			END AS opponent_id
		FROM matches
		WHERE matches.user1_id = ?
			OR matches.user2_id = ?
		)
		SELECT
		user_matches.user1_score,
		user_matches.user2_score,
		user_matches.match_date,
		opponent_user.username AS opponent_username,
		winner_user.username   AS winner_username
		FROM user_matches
		JOIN users AS opponent_user
		ON opponent_user.id = user_matches.opponent_id
		LEFT JOIN users AS winner_user
		ON winner_user.id = user_matches.winner_id
		ORDER BY user_matches.id DESC;
		`);

		const matches = stmt.all(id, id, id);

		return matches || { error: "No matches found" };
    });

	fastify.post("/add-match", async (request, reply) => {
		const { user1_id, user2_id, user1_score, user2_score, winner_id, match_date } = request.body as {
			user1_id: number;
			user2_id: number;
			user1_score: number;
            user2_score: number;
            winner_id: number;
			match_date: string;
		};

		try {
			const stmt = db.prepare(
                "INSERT INTO matches (user1_id, user2_id, user1_score, user2_score, winner_id, match_date) VALUES (?, ?, ?, ?, ?, ?)",
			);
            const result = stmt.run( user1_id, user2_id, user1_score, user2_score, winner_id, match_date);
            return { id: result.lastInsertRowid };
		} catch (err: any) {
			reply.status(400);
			return { error: err.message };
		}
	});

	// fastify.put("/update-match", async (request, reply) => {
	// 	const { id, user1_score, user2_score, winner_id } = request.body as {
	// 		id: number;
	// 		user1_score: number;
	// 		user2_score: number;
	// 		winner_id?: number;
	// 	};
	// 	const match = db.prepare("SELECT 1 FROM matches WHERE id = ?");
	// 	const existingMatch = match.get(id);
	// 	if (!existingMatch) {
	// 		reply.status(404);
	// 		return { error: "Match not found" };
	// 	}
	// 	try {
	// 		const stmt = db.prepare(
	// 			"UPDATE matches SET	user1_score = ?, user2_score = ?, winner_id = COALESCE(?, winner_id) WHERE id = ?");

	// 		stmt.run(user1_score, user2_score, winner_id, id);
	// 	} catch (err: any) {
	// 		reply.status(400);
	// 		return { error: err.message };
	// 	}
	// 	return { success: true };
	// });
}
