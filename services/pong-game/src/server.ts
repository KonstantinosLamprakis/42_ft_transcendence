// server.ts

import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { PongGame, WIDTH, HEIGHT, PADDLE_HEIGHT } from "./game.js";
import { PongMessageType, PongClientMove, PongClientRequest, PongServerResponse } from "./types.js";

const fastify = Fastify({ logger: true });
fastify.register(websocket);

const FPS = 30;
let game = new PongGame();
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

			if (parsed.type === PongMessageType.INIT && parsed.userId) {
				if (!game.connectionPlayer1) {
					game.connectionPlayer1 = { userId: parsed.userId, socket };
				} else if (!game.connectionPlayer2) {
					game.connectionPlayer2 = { userId: parsed.userId, socket };
				} else {
					fastify.log.warn("Game already has two players.");
					return;
				}
			}

			if (!game.connectionPlayer1 || !game.connectionPlayer2) {
				return;
			}

			if (!gameLoop) {
				gameLoop = setInterval(() => {
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

			if (parsed.type === PongMessageType.MOVE) {
				if (socket === game.connectionPlayer1?.socket) {
					if (parsed.move === PongClientMove.UP && game.player1Y > 0) {
						game.player1Y -= 5;
					} else if (parsed.move === PongClientMove.DOWN && game.player1Y < HEIGHT - PADDLE_HEIGHT) {
						game.player1Y += 5;
					}
				}

				if (socket === game.connectionPlayer2?.socket) {
					if (parsed.move === PongClientMove.UP && game.player2Y > 0) {
						game.player2Y -= 5;
					} else if (parsed.move === PongClientMove.DOWN && game.player2Y < HEIGHT - PADDLE_HEIGHT) {
						game.player2Y += 5;
					}
				}
			}
		});
	});
});

fastify.listen({ port: 5003, host: "0.0.0.0" });
