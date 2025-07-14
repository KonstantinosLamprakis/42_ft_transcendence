// server.ts

import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { v4 as uuidv4 } from "uuid";


import { PongGame, WIDTH, HEIGHT, PADDLE_HEIGHT } from "./game.js";
import { PongMessageType, PongClientMove, PongClientRequest, PongServerResponse } from "./types.js";



const fastify = Fastify({ logger: true });
fastify.register(websocket);

const FPS = 30;
const games = new Map<string, PongGame>();
const socketToGameId = new Map<WebSocket, string>();

function findOpenGame(): PongGame | null {
	for (const game of games.values()) {
		if (!game.connectionPlayer2) return game;
	}
	return null;
}

let gameLoop: NodeJS.Timeout | null = null;

fastify.addHook("onRequest", (request, reply, done) => {
	if (request.raw.url?.startsWith("/pong") && request.raw.headers.upgrade === "websocket") {
		fastify.log.info(`WebSocket request for /pong from ${request.ip}`);
	}
	done();
});

fastify.register(async function (fastify) {
	fastify.get("/pong", { websocket: true }, (socket, req) => {
		socket.on("message", (message: Buffer) => {
		let parsed: PongClientRequest;
		try {
			parsed = JSON.parse(message.toString());
		} catch {
			fastify.log.warn("Invalid JSON from client");
			return;
		}

		// === JOINING / CREATING A GAME ===
		if (parsed.type === PongMessageType.INIT && parsed.userId) {
			let game = findOpenGame();

			if (!game) {
				game = new PongGame();
				games.set(uuidv4(), game);
				fastify.log.info(`Created new game: ${game.id}`);
			}

			if (!game.connectionPlayer1) {
				game.connectionPlayer1 = { userId: parsed.userId, socket };
			} else if (!game.connectionPlayer2) {
				game.connectionPlayer2 = { userId: parsed.userId, socket };
			} else {
				fastify.log.warn(`Game ${game.id} is full`);
				return;
			}

			socketToGameId.set(socket, game.id);

			// Start game loop only if both players are connected
			if (game.connectionPlayer1 && game.connectionPlayer2 && !(game as any).loopStarted) {
				(fastify.log.info)(`Starting loop for game ${game.id}`);
				(game as any).loopStarted = true;

				setInterval(() => {
					game.update();

					const payload: PongServerResponse = {
						ballX: game.ballX,
						ballY: game.ballY,
						player1Y: game.player1Y,
						player2Y: game.player2Y,
						scorePlayer1: game.scorePlayer1,
						scorePlayer2: game.scorePlayer2,
					};

					game.connectionPlayer1?.socket.send(JSON.stringify(payload));
					game.connectionPlayer2?.socket.send(JSON.stringify(payload));
				}, 1000 / FPS);
			}
			return;
		}

		// === MOVE HANDLING ===
		const gameId = socketToGameId.get(socket);
		if (!gameId) return;

		const game = games.get(gameId);
		if (!game) return;

		if (parsed.type === PongMessageType.MOVE) {
			if (socket === game.connectionPlayer1?.socket) {
				if (parsed.move === PongClientMove.UP && game.player1Y > 0) game.player1Y -= 5;
				if (parsed.move === PongClientMove.DOWN && game.player1Y < HEIGHT - PADDLE_HEIGHT) game.player1Y += 5;
			}
			if (socket === game.connectionPlayer2?.socket) {
				if (parsed.move === PongClientMove.UP && game.player2Y > 0) game.player2Y -= 5;
				if (parsed.move === PongClientMove.DOWN && game.player2Y < HEIGHT - PADDLE_HEIGHT) game.player2Y += 5;
			}
		}
	});
	// socket.on("close", () => {
	// const gameId = socketToGameId.get(socket);
	// if (!gameId) return;

	// const game = games.get(gameId);
	// if (!game) return;

	// if (game.connectionPlayer1?.socket === socket) game.connectionPlayer1 = null;
	// if (game.connectionPlayer2?.socket === socket) game.connectionPlayer2 = null;

	// socketToGameId.delete(socket);

	// if (!game.connectionPlayer1 && !game.connectionPlayer2) {
	// 	games.delete(gameId);
	// 	fastify.log.info(`Deleted empty game ${gameId}`);
	// }
});

});
// });

fastify.listen({ port: 5003, host: "0.0.0.0" });
