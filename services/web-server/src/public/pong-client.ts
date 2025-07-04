const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

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

let keys: Record<string, boolean> = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function drawRect(x: number, y: number, w: number, h: number, color = "white") {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x: number, y: number, r: number, color = "white") {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawText(text: string, x: number, y: number, size = "30px") {
  ctx.fillStyle = "white";
  ctx.font = `${size} sans-serif`;
  ctx.fillText(text, x, y);
}

function resetBall() {
  ballX = WIDTH / 2;
  ballY = HEIGHT / 2;
  ballVX *= -1;
  ballVY = Math.random() > 0.5 ? 3 : -3;
}

function update() {
  // Player movement
  if (keys["w"] && playerY > 0) playerY -= 5;
  if (keys["s"] && playerY < HEIGHT - PADDLE_HEIGHT) playerY += 5;

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

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawRect(0, 0, WIDTH, HEIGHT, "black");
  drawRect(0, playerY, PADDLE_WIDTH, PADDLE_HEIGHT); // player
  drawRect(WIDTH - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT); // AI
  drawCircle(ballX, ballY, BALL_SIZE);
  drawText(`${playerScore} : ${aiScore}`, WIDTH / 2 - 30, 40);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
