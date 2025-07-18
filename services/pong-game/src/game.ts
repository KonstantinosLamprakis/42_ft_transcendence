import axios from "axios";

import { games, socketToGame } from "./server.js";


import {
	PongMessageType,
    PongClientMove,
    PongServerResponse,
	PongClientRequest,
	Runtime,
} from "./types.js";

const SQLITE_DB_URL = process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:4000" : "http://sqlite-db:4000";

export const WIDTH = 800;
export const HEIGHT = 500;
export const PADDLE_HEIGHT = 100;
export const PADDLE_WIDTH = 10;
export const BALL_SIZE = 10;
export const MAX_BALL_SPEED = 25.0;
export const SPEED_INCREASE = 1.4
export const FPS = 1000/30;
export const PADDLE_SPEED = 15;


export interface Connection {
	userId: string;
	socket: any;
}

// export const SQLITE_DB_URL = process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:4000" : "http://sqlite-db:4000";


export class Game {
	public player1Y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
	public player2Y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
	public ballX = WIDTH / 2;
	public ballY = HEIGHT / 2;
	public ballVX = 5;
	public ballVY = 3;
	public scorePlayer1 = 0;
	public scorePlayer2 = 0;
	public ballSpeed = 7.0;
	public modifier = 1.0;
	public isGameOver = false;
	public winner = "";
	private interval: NodeJS.Timeout;

	public id: string;
	public connectionPlayer1: { userId: string; socket: WebSocket } | null = null;
	public connectionPlayer2: { userId: string; socket: WebSocket } | null = null;

	constructor() {}

	private calculateStartVX() {
		const startVX = Math.random() * (7 - 4) + 4;
		return Math.random() > 0.5 ? startVX : -startVX;
	};

	private calculateStartVY(ballV: number, ballVX: number) {
		const ballVY = Math.sqrt((ballV * ballV) - (ballVX * ballVX));
		return Math.random() > 0.5 ? ballVY : -ballVY;
	}

	public resetBall() {
		this.ballX = WIDTH / 2;
		this.ballY = HEIGHT / 2;
		this.ballSpeed = 7.0;
		this.ballVX = this.calculateStartVX();
		this.ballVY = this.calculateStartVY(this.ballSpeed, this.ballVX);
	};

	public update() {
		this.ballX += this.ballVX;
		this.ballY += this.ballVY;
	
		if (this.ballY < 0 || this.ballY > HEIGHT - BALL_SIZE) this.ballVY *= -1;
	
		// Paddle collision (player 1)
		if (
			this.ballX < PADDLE_WIDTH &&
			this.ballY > this.player1Y &&
			this.ballY < this.player1Y + PADDLE_HEIGHT
		) {
			if (this.ballSpeed < MAX_BALL_SPEED) {
				this.ballSpeed *= SPEED_INCREASE;
			}
			const relativeY = (this.ballY - this.player1Y) / PADDLE_HEIGHT;
			// let modifier = 1.0;
	
			if (relativeY < 0.15) {
				this.modifier = this.ballVY < 0 ? 1.5 : 0.4;
			} else if (relativeY < 0.35) {
				this.modifier = this.ballVY < 0 ? 1.3 : 0.7;
			} else if (relativeY < 0.65) {
				this.modifier = 1.0;
			} else if (relativeY < 0.85) {
				this.modifier = this.ballVY > 0 ? 1.3 : 0.7;
			} else {
				this.modifier = this.ballVY > 0 ? 1.5 : 0.4;
			}
	
			this.ballVY *= this.modifier;
	
			// Clamp VY if needed to keep under total speed
			const maxVY = this.ballSpeed * 0.95;
			if (Math.abs(this.ballVY) > maxVY) {
				this.ballVY = Math.sign(this.ballVY) * maxVY;
			}
	
			// Recalculate VX to preserve ballSpeed
			const oldVXSign = Math.sign(this.ballVX);
			this.ballVX = -oldVXSign * Math.sqrt(
				this.ballSpeed * this.ballSpeed - this.ballVY * this.ballVY);
			this.ballX = PADDLE_WIDTH + BALL_SIZE;
		}
	
		// Paddle collision (player 2)
		if (
			this.ballX > WIDTH - PADDLE_WIDTH - BALL_SIZE &&
			this.ballY > this.player2Y &&
			this.ballY < this.player2Y + PADDLE_HEIGHT
		) {
			if (this.ballSpeed < MAX_BALL_SPEED) {
				this.ballSpeed *= SPEED_INCREASE;
			}
	
			const relativeY = (this.ballY - this.player2Y) / PADDLE_HEIGHT;
			let modifier;
	
			if (relativeY < 0.15) {
				modifier = this.ballVY < 0 ? 1.5 : 0.4;
			} else if (relativeY < 0.35) {
				modifier = this.ballVY < 0 ? 1.3 : 0.7;
			} else if (relativeY < 0.65) {
				modifier = 1.0;
			} else if (relativeY < 0.85) {
				modifier = this.ballVY > 0 ? 1.3 : 0.7;
			} else {
				modifier = this.ballVY > 0 ? 1.5 : 0.4;
			}
	
			this.ballVY *= modifier;
	
			// Clamp VY if needed to keep under total speed
			const maxVY = this.ballSpeed * 0.95;
			if (Math.abs(this.ballVY) > maxVY) {
				this.ballVY = Math.sign(this.ballVY) * maxVY;
			}
	
			// Recalculate VX to preserve ballSpeed
			const oldVXSign = Math.sign(this.ballVX);
			this.ballVX = -oldVXSign * Math.sqrt(
				this.ballSpeed * this.ballSpeed - this.ballVY * this.ballVY);
			this.ballX = WIDTH - PADDLE_WIDTH - BALL_SIZE;
		}
	
		// Check for scoring
		if (this.ballX < 0) {
			this.scorePlayer2++;
			this.resetBall();
		}
		if (this.ballX > WIDTH) {
			this.scorePlayer1++;
			this.resetBall();
		}
	}

	public checkGameEnd(): boolean {
		const p1 = this.scorePlayer1;
		const p2 = this.scorePlayer2;
	
		if ((p1 >= 11 || p2 >= 11) && Math.abs(p1 - p2) >= 2) {
			this.isGameOver = true;
			this.winner = p1 > p2
				? this.connectionPlayer1?.userId || "Player 1"
				: this.connectionPlayer2?.userId || "Player 2";
			return true;
		}
		return false;
	}


	public async endGame() {
		const res = await axios.put(`${SQLITE_DB_URL}/update-match`, {
			id: this.id,
			user1_score: this.scorePlayer1,
			user2_score: this.scorePlayer2,
			winner_id: this.winner,
		});
	
		const win = await axios.put(`${SQLITE_DB_URL}/add-win/${this.winner}`, {
			win: 1
		});
	
		let loser = this.connectionPlayer1.userId;
		if (this.winner === this.connectionPlayer1.userId) {
			loser = this.connectionPlayer2.userId;
		}
		const loss = await axios.put(`${SQLITE_DB_URL}/add-loss/${loser}`, {
			loss: 1
		});
		
		clearInterval(this.interval);
		socketToGame.delete(this.connectionPlayer1.socket);
		socketToGame.delete(this.connectionPlayer2.socket);
		games.delete(this.id);
		// fastify.log.info(`Game ended. Winner: ${this.winner}`);
	}

	public Start()
	{
		this.interval = setInterval(() => {
      		if (!this.isGameOver) {
				this.update();
				if (this.checkGameEnd()) {
					this.endGame();
					return;
				}
			}

			const payload: PongServerResponse = {
				type: PongMessageType.DRAW,
				ballX: this.ballX,
				ballY: this.ballY,
				player1Y: this.player1Y,
				player2Y: this.player2Y,
				scorePlayer1: this.scorePlayer1,
				scorePlayer2: this.scorePlayer2,
			};

			if (this.connectionPlayer1?.socket)
				this.connectionPlayer1.socket.send(JSON.stringify(payload));
			if (this.connectionPlayer2?.socket)
				this.connectionPlayer2.socket.send(JSON.stringify(payload));
    	}, FPS);
	}
}