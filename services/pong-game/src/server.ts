import Fastify from "fastify";
import websocket from "@fastify/websocket";

export enum PongMessageType {
	INIT = "init",
	MOVE = "move",
};

export enum PongClientMove {
	UP = "w",
	DOWN = "s",
};

export type PongClientRequest = {
	type: PongMessageType;
	move?: PongClientMove;
	userId?: string;
};

export type PongServerResponse = {
	ballX: number;
	ballY: number;
	player1Y: number;
	player2Y: number;
	scorePlayer1: number;
	scorePlayer2: number;
};


const fastify = Fastify({ logger: true });
fastify.register(websocket);

interface Connection {
	userId: string;
	socket: any;
};

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
};


const games = new Map<string, Game>();

const FPS = 30;

const WIDTH = 800;
const HEIGHT = 500;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;


const game: Game = {
    GameId: 0,
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
};


function resetBall(game: Game) {
    game.ballX = WIDTH / 2;
    game.ballY = HEIGHT / 2;
    game.ballVX *= -1;
    game.ballVY = Math.random() > 0.5 ? 3 : -3;
};

function update(game: Game) {

    // Ball movement
    game.ballX += game.ballVX;
    game.ballY += game.ballVY;

    // Wall collision
    if (game.ballY < 0 || game.ballY > HEIGHT - BALL_SIZE) game.ballVY *= -1;

    // Paddle collision
    if (
        game.ballX < PADDLE_WIDTH &&
        game.ballY > game.player1Y &&
        game.ballY < game.player1Y + PADDLE_HEIGHT
    ) {
        game.ballVX *= -1.0;
        game.ballX = PADDLE_WIDTH; // avoid sticky
    }

    if (
        game.ballX > WIDTH - PADDLE_WIDTH - BALL_SIZE &&
        game.ballY > game.player2Y &&
        game.ballY < game.player2Y + PADDLE_HEIGHT
    ) {
        game.ballVX *= -1.0;
        game.ballX = WIDTH - PADDLE_WIDTH - BALL_SIZE; // avoid sticky
    }

    // Score
    if (game.ballX < 0) {
        game.scorePlayer2++;
        resetBall(game);
    }
    if (game.ballX > WIDTH) {
        game.scorePlayer1++;
        resetBall(game);
    }
};

fastify.addHook("onRequest", (request, reply, done) => {
	if (request.raw.url?.startsWith("/pong") && request.raw.headers.upgrade === "websocket") {
		fastify.log.info(`WebSocket request for /pong from ${request.ip}`);
	}
	done();
});

let gameLoop: NodeJS.Timeout | null = null;

fastify.register(async function (fastify) {
	fastify.get("/pong", { websocket: true }, (socket, req) => {

        socket.on("message", (message: Buffer) => {
            let parsed;

            try {
                parsed = JSON.parse(message.toString());
                // fastify.log.info("Received message:", parsed);
            } catch (e) {
                fastify.log.warn("Invalid JSON from client:", message.toString());
                return;
            }

            if (parsed.type === PongMessageType.INIT && parsed.userId) {
                fastify.log.info(`Initialising game for user: ${parsed.userId}`);
                if (!game.connectionPlayer1) {
                    game.connectionPlayer1 = { userId: parsed.userId, socket: socket };
                }
                else if (!game.connectionPlayer2) {
                    game.connectionPlayer2 = { userId: parsed.userId, socket: socket };
                } else {
                    fastify.log.warn("Game already has two players connected.");
                    return;
                }
            }

            if (!game.connectionPlayer1 || !game.connectionPlayer2) {
                fastify.log.warn("Game not initialised, not yet two players.");
                return;
            }

            if (game.connectionPlayer1 && game.connectionPlayer2 && !gameLoop) {
                fastify.log.info("Starting game loop");
                gameLoop = setInterval(() => {
                    update(game);
                    // fastify.log.info(`Game state: Player1 Y: ${game.player1Y}, Player2 Y: ${game.player2Y}, Ball X: ${game.ballX}, Ball Y: ${game.ballY}, Score P1: ${game.scorePlayer1}, Score P2: ${game.scorePlayer2}`);
                    const payload: PongServerResponse = {
                        ballX: game.ballX,
                        ballY: game.ballY,
                        player1Y: game.player1Y,
                        player2Y: game.player2Y,
                        scorePlayer1: game.scorePlayer1,
                        scorePlayer2: game.scorePlayer2,
                    };
                    if (game.connectionPlayer1) {
                        game.connectionPlayer1.socket.send(JSON.stringify(payload));
                    }
                    if (game.connectionPlayer2) {
                        game.connectionPlayer2.socket.send(JSON.stringify(payload));
                    }
                }, 1000 / FPS);
            }

            if (socket === game.connectionPlayer1.socket && parsed.type === PongMessageType.MOVE) {
                // fastify.log.info(`Player 1 move: ${parsed.move}`);
                if (parsed.move === PongClientMove.UP && game.player1Y > 0) {
                    game.player1Y -= 5;
                } else if (parsed.move === PongClientMove.DOWN && game.player1Y < HEIGHT - PADDLE_HEIGHT) {
                    game.player1Y += 5;
                }
            }
            if (socket === game.connectionPlayer2.socket && parsed.type === PongMessageType.MOVE) {
                // fastify.log.info(`Player 2 move: ${parsed.move}`);
                if (parsed.move === PongClientMove.UP && game.player2Y > 0) {
                    game.player2Y -= 5;
                } else if (parsed.move === PongClientMove.DOWN && game.player2Y < HEIGHT - PADDLE_HEIGHT) {
                    game.player2Y += 5;
                }
            }
        });


		// socket.on("close", () => {
		// 	const disconnectPayload: ChatServerResponse = {
		// 		type: ChatMessageType.STATUS,
		// 		content: `User ${connections.get(connId)?.name || "Anonymous"} disconnected.`,
		// 		name: connections.get(connId)?.name || "Anonymous",
		// 		timestamp: Date.now(),
		// 		senderId: connId,
		// 	};
		// 	connections.delete(connId);
		// 	connections.forEach((conn) => conn.socket.send(JSON.stringify(disconnectPayload)));
		// 	fastify.log.info(`Client disconnected: ${connId}`);
		// });

		// socket.on("error", (err: any) => {
		// 	fastify.log.error(`WebSocket error for ${connId}: ${err.message}`);
		// });
	});
});

fastify.listen({ port: 5003, host: "0.0.0.0" });
