import Fastify from "fastify";
import websocket from "@fastify/websocket";

export enum PongMessageType {
	INIT = "init",
	MOVE = "move",
}

export enum PongClientMove {
	UP = "w",
	DOWN = "s",
}

export type PongClientRequest = {
	type: PongMessageType;
	move?: PongClientMove;
	userId?: string;
}

export type PongServerResponse = {
	type?: string;
	ballX: number;
	ballY: number;
	player1Y: number;
	player2Y: number;
	scorePlayer1: number;
	scorePlayer2: number;
	winner?: string;
}

const fastify = Fastify({ logger: true });
fastify.register(websocket);

interface Connection {
	userId: string;
	socket: any;
}

interface Game {
	GameId: number;
	connectionPlayer1: Connection | null;
	connectionPlayer2: Connection | null;
	player1Y: number;
	player2Y: number;
	ballX: number;
	ballY: number;
	ballVX: number;
	ballVY: number;
	scorePlayer1: number;
	scorePlayer2: number;
	isGameOver: boolean;
	winner: string | null;
}

const WIDTH = 800;
const HEIGHT = 500;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;
const FPS = 30;

function createNewGame(): Game {
	return {
		GameId: Date.now(),
		connectionPlayer1: null,
		connectionPlayer2: null,
		player1Y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
		player2Y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
		ballX: WIDTH / 2,
		ballY: HEIGHT / 2,
		ballVX: 5,
		ballVY: 3,
		scorePlayer1: 0,
		scorePlayer2: 0,
		isGameOver: false,
		winner: null,
	};
}

let game = createNewGame();
let gameLoop: NodeJS.Timeout | null = null;

function resetBall(game: Game) {
	game.ballX = WIDTH / 2;
	game.ballY = HEIGHT / 2;
	game.ballVX *= -1;
	game.ballVY = Math.random() > 0.5 ? 3 : -3;
}

function update(game: Game) {
	game.ballX += game.ballVX;
	game.ballY += game.ballVY;

	if (game.ballY < 0 || game.ballY > HEIGHT - BALL_SIZE) game.ballVY *= -1;

	if (
		game.ballX < PADDLE_WIDTH &&
		game.ballY > game.player1Y &&
		game.ballY < game.player1Y + PADDLE_HEIGHT
	) {
		game.ballVX *= -1;
		game.ballX = PADDLE_WIDTH;
	}

	if (
		game.ballX > WIDTH - PADDLE_WIDTH - BALL_SIZE &&
		game.ballY > game.player2Y &&
		game.ballY < game.player2Y + PADDLE_HEIGHT
	) {
		game.ballVX *= -1;
		game.ballX = WIDTH - PADDLE_WIDTH - BALL_SIZE;
	}

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
			? game.connectionPlayer1?.userId || "Player 1"
			: game.connectionPlayer2?.userId || "Player 2";
		return true;
	}
	return false;
}

function endGame() {
	const result: PongServerResponse = {
		type: "game_end",
		ballX: game.ballX,
		ballY: game.ballY,
		player1Y: game.player1Y,
		player2Y: game.player2Y,
		scorePlayer1: game.scorePlayer1,
		scorePlayer2: game.scorePlayer2,
		winner: game.winner,
	};

	if (game.connectionPlayer1?.socket) {
		game.connectionPlayer1.socket.send(JSON.stringify(result));
	}
	if (game.connectionPlayer2?.socket) {
		game.connectionPlayer2.socket.send(JSON.stringify(result));
	}

	if (gameLoop) {
		clearInterval(gameLoop);
		gameLoop = null;
	}

	fastify.log.info(`Game ended. Winner: ${game.winner}`);

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

			if (!game.connectionPlayer1 || !game.connectionPlayer2) return;

			if (!gameLoop && !game.isGameOver) {
				gameLoop = setInterval(() => {
					if (!game.isGameOver) {
						update(game);
						if (checkGameEnd(game)) {
							endGame();
							return;
						}
					}

					const payload: PongServerResponse = {
						ballX: game.ballX,
						ballY: game.ballY,
						player1Y: game.player1Y,
						player2Y: game.player2Y,
						scorePlayer1: game.scorePlayer1,
						scorePlayer2: game.scorePlayer2,
					};

					if (game.connectionPlayer1?.socket)
						game.connectionPlayer1.socket.send(JSON.stringify(payload));
					if (game.connectionPlayer2?.socket)
						game.connectionPlayer2.socket.send(JSON.stringify(payload));
				}, 1000 / FPS);
			}

			if (parsed.type === PongMessageType.MOVE && !game.isGameOver) {
				if (socket === game.connectionPlayer1?.socket) {
					if (parsed.move === PongClientMove.UP && game.player1Y > 0)
						game.player1Y -= 5;
					else if (parsed.move === PongClientMove.DOWN && game.player1Y < HEIGHT - PADDLE_HEIGHT)
						game.player1Y += 5;
				}
				if (socket === game.connectionPlayer2?.socket) {
					if (parsed.move === PongClientMove.UP && game.player2Y > 0)
						game.player2Y -= 5;
					else if (parsed.move === PongClientMove.DOWN && game.player2Y < HEIGHT - PADDLE_HEIGHT)
						game.player2Y += 5;
				}
			}
		});

		socket.on("close", () => {
			if (!game.isGameOver) {
				if (socket === game.connectionPlayer1?.socket) {
					game.scorePlayer2 = 11;
					game.scorePlayer1 = 0;
					game.winner = game.connectionPlayer2?.userId || "Player 2";
				} else if (socket === game.connectionPlayer2?.socket) {
					game.scorePlayer1 = 11;
					game.scorePlayer2 = 0;
					game.winner = game.connectionPlayer1?.userId || "Player 1";
				}
				game.isGameOver = true;
				endGame();
			}
		});
	});
});

fastify.listen({ port: 5003, host: "0.0.0.0" });
