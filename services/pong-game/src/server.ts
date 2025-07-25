import Fastify from "fastify";
import websocket from "@fastify/websocket";
import type { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";

import {
    PongMessageType,
    PongClientMove,
    PongServerResponse,
	PongClientRequest,
	Runtime,
} from "./types.js";

import { Game, HEIGHT, PADDLE_HEIGHT, PADDLE_SPEED, WIDTH } from "./game.js";


const fastify = Fastify();
fastify.register(websocket);
// const games = new Map<number, Game>();

export const games = new Map<string, Game>();
export const socketToGame = new Map<WebSocket, string>();

function findOpenGame(): Game | null {
	for (const game of games.values()) {
		if (!game.connectionPlayer2 && !game.isGameOver) return game;
	}
	return null;
}

// let modifier = 1.0;

fastify.addHook("onRequest", (request, reply, done) => {
	if (request.raw.url?.startsWith("/pong") && request.raw.headers.upgrade === "websocket") {
		fastify.log.info(`WebSocket request from ${request.ip}`);
	}
	done();
});

fastify.register(async function (fastify) {
	fastify.get("/pong", { websocket: true }, (socket: WebSocket, req) => {

		let userId;
		if (req.query && typeof req.query === 'object' && 'userId' in req.query) {
			userId = req.query.userId as string; //check
		}
        if (!userId) {
            fastify.log.warn('WebSocket connection rejected - missing user userId URL query ');
            socket.close(1008, 'Authentication required');
            return;
        }

        
		socket.on("message", async (message: Buffer) => {
			let parsed: PongClientRequest;
			try {
				parsed = JSON.parse(message.toString());
			} catch {
				fastify.log.warn("Invalid JSON from client");
				return;
			}
			
			// console.log("Received message:", parsed);
			if (parsed.type === PongMessageType.INIT) {
				
				let Room = findOpenGame();

				if (!Room)
				{
					Room = new Game()
					const _id = uuidv4();
					Room.gameId = _id;
					games.set(_id, Room);
					Room.connectionPlayer1 = socket;
					Room.player1UserId = userId;
					socketToGame.set(socket, _id);
				}
				else
				{
					Room.connectionPlayer2 = socket;
					Room.player2UserId = userId;
					socketToGame.set(socket, Room.gameId);
					Room.Start();
				}
			}

			else if (parsed.type === PongMessageType.MOVE) {

				const _id = socketToGame.get(socket);
				if (!_id)
					return ;
				const game = games.get(_id);
				if (!game || game.isGameOver)
					return ;
				if (socket === game.connectionPlayer1) {
					if (parsed.move === PongClientMove.UP && game.player1Y > 0)
						game.player1Y -= PADDLE_SPEED;
					else if (parsed.move === PongClientMove.DOWN && game.player1Y < HEIGHT - PADDLE_HEIGHT)
						game.player1Y += PADDLE_SPEED;
				}
				if (socket === game.connectionPlayer2) {
					if (parsed.move === PongClientMove.UP && game.player2Y > 0)
						game.player2Y -= PADDLE_SPEED;
					else if (parsed.move === PongClientMove.DOWN && game.player2Y < HEIGHT - PADDLE_HEIGHT)
						game.player2Y += PADDLE_SPEED;
				}
			}
		});

		socket.on("close", () => {

			const _id = socketToGame.get(socket);
			if (!_id)
				return ;
			const game = games.get(_id);
			if (!game || game.isGameOver)
				return ;

			if (!game.isGameOver) {
				if (socket === game.connectionPlayer1) {
					game.scorePlayer2 = 11;
					game.scorePlayer1 = 0;
					game.winner = game.player2UserId;
				} else if (socket === game.connectionPlayer2) {
					game.scorePlayer1 = 11;
					game.scorePlayer2 = 0;
					game.winner = game.player1UserId;
				}
				game.isGameOver = true;
				game.endGame();
			}
		});
	});
});

fastify.listen({ port: 5003, host: "0.0.0.0" });
