import Fastify from "fastify";
import websocket from "@fastify/websocket";
import type { WebSocket } from "ws";
import axios from "axios";

import {
    PongMessageType,
    PongClientMove,
    PongServerResponse,
	PongClientRequest,
	Runtime,
} from "./types.js";

const SQLITE_DB_URL = process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:4000" : "http://sqlite-db:4000";

const fastify = Fastify({ logger: true });
fastify.register(websocket);

interface Game {
	gameId: number;
	connectionPlayer1: WebSocket | null;
    connectionPlayer2: WebSocket | null;
    player1Y: number;
    player2Y: number;
    ballX: number;
    ballY: number;
    ballSpeed: number;
    ballVX: number;
    ballVY: number;
    scorePlayer1: number;
    scorePlayer2: number;
    isGameOver: boolean;
    player1UserId: string | null;
    player2UserId: string | null;
    winner: string | null;
};


const games = new Map<number, Game>();

const FPS = 30;
const WIDTH = 800;
const HEIGHT = 500;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const PADDLE_SPEED = 15;
const BALL_SIZE = 5;
const MAX_BALL_SPEED = 25.0;
const SPEED_INCREASE = 1.4
const START_BALLVX: number = calculateStartVX();
let modifier = 1.0;

function calculateStartVX() {
    const startVX = Math.random() * (7 - 4) + 4;
    return Math.random() > 0.5 ? startVX : -startVX;
};

function calculateStartVY(ballV: number, ballVX: number) {
    const ballVY = Math.sqrt((ballV * ballV) - (ballVX * ballVX));
    return Math.random() > 0.5 ? ballVY : -ballVY;
}

function resetBall(game: Game) {
    game.ballX = WIDTH / 2;
    game.ballY = HEIGHT / 2;
    game.ballSpeed = 7.0;
    game.ballVX = calculateStartVX();
    game.ballVY = calculateStartVY(game.ballSpeed, game.ballVX);
};

function createNewGame(): Game {
	return {
        gameId: null,
        connectionPlayer1: null,
        connectionPlayer2: null,
        player1Y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
        player2Y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
        ballX: WIDTH / 2,
        ballY: HEIGHT / 2,
        ballSpeed: 7.0,
        ballVX: START_BALLVX,
        ballVY: calculateStartVY(10, START_BALLVX),
        scorePlayer1: 0,
        scorePlayer2: 0,
		isGameOver: false,
	    player1UserId: null,
	    player2UserId: null,
		winner: null,
	};
}

let game = createNewGame();
let gameLoop: NodeJS.Timeout | null = null;

function update(game: Game) {
	game.ballX += game.ballVX;
	game.ballY += game.ballVY;

	if (game.ballY < 0 || game.ballY > HEIGHT - BALL_SIZE) game.ballVY *= -1;

    // Paddle collision (player 1)
    if (
        game.ballX < PADDLE_WIDTH &&
        game.ballY > game.player1Y &&
        game.ballY < game.player1Y + PADDLE_HEIGHT
    ) {
        if (game.ballSpeed < MAX_BALL_SPEED) {
            game.ballSpeed *= SPEED_INCREASE;
        }
        const relativeY = (game.ballY - game.player1Y) / PADDLE_HEIGHT;
        // let modifier = 1.0;

        if (relativeY < 0.15) {
            modifier = game.ballVY < 0 ? 1.5 : 0.4;
        } else if (relativeY < 0.35) {
            modifier = game.ballVY < 0 ? 1.3 : 0.7;
        } else if (relativeY < 0.65) {
            modifier = 1.0;
        } else if (relativeY < 0.85) {
            modifier = game.ballVY > 0 ? 1.3 : 0.7;
        } else {
            modifier = game.ballVY > 0 ? 1.5 : 0.4;
        }

        game.ballVY *= modifier;

        // Clamp VY if needed to keep under total speed
        const maxVY = game.ballSpeed * 0.95;
        if (Math.abs(game.ballVY) > maxVY) {
            game.ballVY = Math.sign(game.ballVY) * maxVY;
        }

        // Recalculate VX to preserve ballSpeed
        const oldVXSign = Math.sign(game.ballVX);
        game.ballVX = -oldVXSign * Math.sqrt(
            game.ballSpeed * game.ballSpeed - game.ballVY * game.ballVY);
        game.ballX = PADDLE_WIDTH + BALL_SIZE;
    }

    // Paddle collision (player 2)
    if (
        game.ballX > WIDTH - PADDLE_WIDTH - BALL_SIZE &&
        game.ballY > game.player2Y &&
        game.ballY < game.player2Y + PADDLE_HEIGHT
    ) {
        if (game.ballSpeed < MAX_BALL_SPEED) {
            game.ballSpeed *= SPEED_INCREASE;
        }

        const relativeY = (game.ballY - game.player2Y) / PADDLE_HEIGHT;
        let modifier;

        if (relativeY < 0.15) {
            modifier = game.ballVY < 0 ? 1.5 : 0.4;
        } else if (relativeY < 0.35) {
            modifier = game.ballVY < 0 ? 1.3 : 0.7;
        } else if (relativeY < 0.65) {
            modifier = 1.0;
        } else if (relativeY < 0.85) {
            modifier = game.ballVY > 0 ? 1.3 : 0.7;
        } else {
            modifier = game.ballVY > 0 ? 1.5 : 0.4;
        }

        game.ballVY *= modifier;

        // Clamp VY if needed to keep under total speed
        const maxVY = game.ballSpeed * 0.95;
        if (Math.abs(game.ballVY) > maxVY) {
            game.ballVY = Math.sign(game.ballVY) * maxVY;
        }

        // Recalculate VX to preserve ballSpeed
        const oldVXSign = Math.sign(game.ballVX);
        game.ballVX = -oldVXSign * Math.sqrt(
            game.ballSpeed * game.ballSpeed - game.ballVY * game.ballVY);
        game.ballX = WIDTH - PADDLE_WIDTH - BALL_SIZE;
    }

    // Check for scoring
    if (game.ballX < 0) {
		game.scorePlayer2++;
		resetBall(game);
	}
	if (game.ballX > WIDTH) {
		game.scorePlayer1++;
		resetBall(game);
	}
}

function checkGameEnd(game: Game): boolean {
	const p1 = game.scorePlayer1;
	const p2 = game.scorePlayer2;

	if ((p1 >= 11 || p2 >= 11) && Math.abs(p1 - p2) >= 2) {
		game.isGameOver = true;
		game.winner = p1 > p2
			? game.player1UserId
			: game.player2UserId;
		return true;
	}
	return false;
}

async function endGame() {

	const result: PongServerResponse = {
		type: PongMessageType.END,
		ballX: game.ballX,
		ballY: game.ballY,
		player1Y: game.player1Y,
		player2Y: game.player2Y,
		scorePlayer1: game.scorePlayer1,
		scorePlayer2: game.scorePlayer2,
		winner: game.winner,
	};

	if (game.connectionPlayer1) {
		game.connectionPlayer1.send(JSON.stringify(result));
	}
	if (game.connectionPlayer2) {
		game.connectionPlayer2.send(JSON.stringify(result));		
	}

	// fastify.log.info(`Game INFO: id: ${game.gameId}  user1_score: ${game.scorePlayer1}  user2_score: ${game.scorePlayer2}  winner: ${game.winner}`);
	if (game.gameId) {
		const res = await axios.put(`${SQLITE_DB_URL}/update-match`, {
			id: game.gameId,
			user1_score: game.scorePlayer1,
			user2_score: game.scorePlayer2,
			winner_id: game.winner,
		});
	}

	if (game.winner) {
		const win = await axios.put(`${SQLITE_DB_URL}/add-win/${game.winner}`, {});

		let loser = game.player1UserId;
		if (game.winner === game.player1UserId) {
			loser = game.player2UserId;
		}
		const loss = await axios.put(`${SQLITE_DB_URL}/add-loss/${loser}`, {});
	}

	if (gameLoop) {
		clearInterval(gameLoop);
		gameLoop = null;
	}

	if (game.winner) {
		fastify.log.info(`Game ended. Winner: ${game.winner}`);
	}
	
	// Reset the game after a short delay to allow rematches
	setTimeout(() => {
		game = createNewGame();
	}, 1000);
}

fastify.addHook("onRequest", (request, reply, done) => {
	if (request.raw.url?.startsWith("/pong") && request.raw.headers.upgrade === "websocket") {
		fastify.log.info(`WebSocket request from ${request.ip}`);
	}
	done();
});

fastify.register(async function (fastify) {
	fastify.get("/pong", { websocket: true }, (socket: WebSocket, req) => {
		socket.on("message", async (message: Buffer) => {
			let parsed: PongClientRequest;
			try {
				parsed = JSON.parse(message.toString());
			} catch {
				fastify.log.warn("Invalid JSON from client");
				return;
			}

			if (parsed.type === PongMessageType.INIT && parsed.userId) {
				if (!game.connectionPlayer1) {
					game.connectionPlayer1 = socket;
					game.player1UserId = parsed.userId;
				} else if (!game.connectionPlayer2) {
					game.connectionPlayer2 = socket;
					game.player2UserId = parsed.userId;
				} else {
					fastify.log.warn("Game already has two players.");
					return;
				}
			}

			if (!game.connectionPlayer1 || !game.connectionPlayer2) return;

			if (!gameLoop && !game.isGameOver) {
				const dateNow = new Date(Date.now());
				const res = await axios.post(`${SQLITE_DB_URL}/add-match`, {
					user1_id: game.player1UserId,
					user2_id: game.player2UserId,
					user1_score: 0,
					user2_score: 0,
					winner_id: null,
					match_date: dateNow.toISOString().slice(0, 10)
				});
				game.gameId = res.data.id;

				gameLoop = setInterval(() => {
					if (!game.isGameOver) {
						update(game);
						if (checkGameEnd(game)) {
							endGame();
							return;
						}
					}

					const payload: PongServerResponse = {
                        type: PongMessageType.DRAW,
						ballX: game.ballX,
						ballY: game.ballY,
						player1Y: game.player1Y,
						player2Y: game.player2Y,
						scorePlayer1: game.scorePlayer1,
						scorePlayer2: game.scorePlayer2,
					};

					if (game.connectionPlayer1)
						game.connectionPlayer1.send(JSON.stringify(payload));
					if (game.connectionPlayer2)
						game.connectionPlayer2.send(JSON.stringify(payload));
				}, 1000 / FPS);
			}

			if (parsed.type === PongMessageType.MOVE && !game.isGameOver) {
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
				endGame();
			}
		});
	});
});

fastify.listen({ port: 5003, host: "0.0.0.0" });
