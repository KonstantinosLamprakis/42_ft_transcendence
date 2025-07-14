// pongGame.ts

export const WIDTH = 800;
export const HEIGHT = 500;
export const PADDLE_WIDTH = 10;
export const PADDLE_HEIGHT = 100;
export const BALL_SIZE = 10;

export interface Connection {
	userId: string;
	socket: any;
}

export class PongGame {
	public player1Y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
	public player2Y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
	public ballX = WIDTH / 2;
	public ballY = HEIGHT / 2;
	public ballVX = 5;
	public ballVY = 3;
	public scorePlayer1 = 0;
	public scorePlayer2 = 0;

	public connectionPlayer1: Connection | null = null;
	public connectionPlayer2: Connection | null = null;

	constructor() {}

	public resetBall() {
		this.ballX = WIDTH / 2;
		this.ballY = HEIGHT / 2;
		this.ballVX *= -1;
		this.ballVY = Math.random() > 0.5 ? 3 : -3;
	}

	public update() {
		this.ballX += this.ballVX;
		this.ballY += this.ballVY;

		// Wall collision
		if (this.ballY < 0 || this.ballY > HEIGHT - BALL_SIZE) {
			this.ballVY *= -1;
		}

		// Paddle 1
		if (
			this.ballX < PADDLE_WIDTH &&
			this.ballY > this.player1Y &&
			this.ballY < this.player1Y + PADDLE_HEIGHT
		) {
			this.ballVX *= -1;
			this.ballX = PADDLE_WIDTH;
		}

		// Paddle 2
		if (
			this.ballX > WIDTH - PADDLE_WIDTH - BALL_SIZE &&
			this.ballY > this.player2Y &&
			this.ballY < this.player2Y + PADDLE_HEIGHT
		) {
			this.ballVX *= -1;
			this.ballX = WIDTH - PADDLE_WIDTH - BALL_SIZE;
		}

		// Scoring
		if (this.ballX < 0) {
			this.scorePlayer2++;
			this.resetBall();
		}
		if (this.ballX > WIDTH) {
			this.scorePlayer1++;
			this.resetBall();
		}
	}
}
