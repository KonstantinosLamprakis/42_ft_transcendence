export class Game {
  private playerPaddleY: number = 250;
  private computerPaddleY: number = 250;
  private ballX: number = 400;
  private ballY: number = 300;
  private ballVX: number = 5;
  private ballVY: number = 5;
  private playerScore: number = 0;
  private computerScore: number = 0;
  private readonly paddleHeight: number = 100;
  private readonly paddleWidth: number = 10;
  private readonly canvasWidth: number = 800;
  private readonly canvasHeight: number = 600;

  constructor() {}

  update() {
    this.ballX += this.ballVX;
    this.ballY += this.ballVY;

    if (this.ballY <= 0 || this.ballY >= this.canvasHeight) {
      this.ballVY = -this.ballVY;
    }

    this.updateComputerPaddle();

    if (
      this.ballX <= this.paddleWidth &&
      this.ballY >= this.playerPaddleY &&
      this.ballY <= this.playerPaddleY + this.paddleHeight
    ) {
      this.ballVX = -this.ballVX;
    } else if (
      this.ballX >= this.canvasWidth - this.paddleWidth &&
      this.ballY >= this.computerPaddleY &&
      this.ballY <= this.computerPaddleY + this.paddleHeight
    ) {
      this.ballVX = -this.ballVX;
    }

    if (this.ballX <= 0) {
      this.computerScore++;
      this.resetBall();
    } else if (this.ballX >= this.canvasWidth) {
      this.playerScore++;
      this.resetBall();
    }
  }

  private updateComputerPaddle() {
    const paddleCenter = this.computerPaddleY + this.paddleHeight / 2;
    if (paddleCenter < this.ballY - 35) {
      this.computerPaddleY += 5;
    } else if (paddleCenter > this.ballY + 35) {
      this.computerPaddleY -= 5;
    }
    this.computerPaddleY = Math.max(0, Math.min(this.canvasHeight - this.paddleHeight, this.computerPaddleY));
  }

  private resetBall() {
    this.ballX = this.canvasWidth / 2;
    this.ballY = this.canvasHeight / 2;
    this.ballVX = -this.ballVX;
    this.ballVY = Math.random() * 10 - 5;
  }

  movePlayerPaddle(direction: "up" | "down") {
    if (direction === "up") {
      this.playerPaddleY = Math.max(0, this.playerPaddleY - 10);
    } else {
      this.playerPaddleY = Math.min(this.canvasHeight - this.paddleHeight, this.playerPaddleY + 10);
    }
  }

  getState() {
    return {
      playerPaddleY: this.playerPaddleY,
      computerPaddleY: this.computerPaddleY,
      ballX: this.ballX,
      ballY: this.ballY,
      playerScore: this.playerScore,
      computerScore: this.computerScore,
    };
  }
}