import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { randomUUID } from "crypto";

export enum PongClientMove {
	UP = "w",
	DOWN = "s",
};

export type PongServerResponse = {
	ballX: number;
	ballY: number;
	playerY: number;
	oponentY: number;
	scorePlayer: number;
	scoreOpponent: number;
};

const fastify = Fastify({ logger: true });
fastify.register(websocket);

interface Connection {
	id: string;
	name: string;
	socket: any;
}

const connections = new Map<string, Connection>();

const FPS = 30;

const WIDTH = 800;
const HEIGHT = 500;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;

let playerY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let aiY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let ballX = WIDTH / 2;
let ballY = HEIGHT / 2;
let ballVX = 5;
let ballVY = 3;

let playerScore = 0;
let aiScore = 0;


function resetBall() {
  ballX = WIDTH / 2;
  ballY = HEIGHT / 2;
  ballVX *= -1;
  ballVY = Math.random() > 0.5 ? 3 : -3;
}

function update() {

  // AI movement
  if (aiY + PADDLE_HEIGHT / 2 < ballY) aiY += 4;
  else if (aiY + PADDLE_HEIGHT / 2 > ballY) aiY -= 4;

  // Ball movement
  ballX += ballVX;
  ballY += ballVY;

  // Wall collision
  if (ballY < 0 || ballY > HEIGHT - BALL_SIZE) ballVY *= -1;

  // Paddle collision
  if (
    ballX < PADDLE_WIDTH &&
    ballY > playerY &&
    ballY < playerY + PADDLE_HEIGHT
  ) {
    ballVX *= -1.0;
    ballX = PADDLE_WIDTH; // avoid sticky
  }

  if (
    ballX > WIDTH - PADDLE_WIDTH - BALL_SIZE &&
    ballY > aiY &&
    ballY < aiY + PADDLE_HEIGHT
  ) {
    ballVX *= -1.0;
    ballX = WIDTH - PADDLE_WIDTH - BALL_SIZE; // avoid sticky
  }

  // Score
  if (ballX < 0) {
    aiScore++;
    resetBall();
  }
  if (ballX > WIDTH) {
    playerScore++;
    resetBall();
  }
}

fastify.addHook("onRequest", (request, reply, done) => {
	if (request.raw.url?.startsWith("/pong") && request.raw.headers.upgrade === "websocket") {
		fastify.log.info(`WebSocket request for /pong from ${request.ip}`);
	}
	done();
});

fastify.register(async function (fastify) {
	fastify.get("/pong", { websocket: true }, (socket, req) => {
		const connId = randomUUID();
		let userName = "Anonymous";

		connections.set(connId, { id: connId, name: userName, socket });

		// Send initial position and assign ID
		const payload: PongServerResponse = {
            ballX: ballX,
            ballY: ballY,
            playerY: playerY,
            oponentY: aiY,
            scorePlayer: playerScore,
            scoreOpponent: aiScore,
			// senderId: connId,
		};
		socket.send(JSON.stringify(payload));


        
        socket.on("message", (message: Buffer) => {
            let parsed;
            try {
                parsed = JSON.parse(message.toString());
                if (parsed.move === PongClientMove.UP && playerY > 0) {
                    playerY -= 5;
                } else if (parsed.move === PongClientMove.DOWN && playerY < HEIGHT - PADDLE_HEIGHT) {
                    playerY += 5;
                }
            } catch (e) {
                fastify.log.warn("Invalid JSON from client:", message.toString());
                return;
            }
            
        });
        setInterval(() => {
            update();
            const payload: PongServerResponse = {
                ballX: ballX,
                ballY: ballY,
                playerY: playerY,
                oponentY: aiY,
                scorePlayer: playerScore,
                scoreOpponent: aiScore,
                // senderId: connId,
            };
            socket.send(JSON.stringify(payload));
        }, 1000 / FPS);



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
