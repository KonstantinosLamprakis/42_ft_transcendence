import {
    WEBSOCKET_API_URL,
    PongClientMove,
    PongServerResponse,
    PongMessageType,
} from "./types.js";


let socket: WebSocket | null = null;

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;

let playerY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let opponentY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let ballX = WIDTH / 2;
let ballY = HEIGHT / 2;

let playerScore = 0;
let opponentScore = 0;

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
};

function drawCircle(x: number, y: number, r: number, color = "white") {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
};

function drawText(text: string, x: number, y: number, size = "30px") {
    ctx.fillStyle = "white";
    ctx.font = `${size} sans-serif`;
    ctx.fillText(text, x, y);
};

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawRect(0, 0, WIDTH, HEIGHT, "black");
    drawRect(0, playerY, PADDLE_WIDTH, PADDLE_HEIGHT); // player
    drawRect(WIDTH - PADDLE_WIDTH, opponentY, PADDLE_WIDTH, PADDLE_HEIGHT); // AI
    drawCircle(ballX, ballY, BALL_SIZE);
    drawText(`${playerScore} : ${opponentScore}`, WIDTH / 2 - 30, 40);
};


// Connect to the WebSocket server
function connectWebSocket(userId: string): void {
// Use 'ws://' for development. For production, consider 'wss://' with HTTPS.
    socket = new WebSocket(WEBSOCKET_API_URL + "/pong");

    socket.onopen = (event: Event) => {
        console.log("WebSocket connected:", event);

        // Send userId to the server right after connection is open
        if (userId) {
            socket?.send(JSON.stringify({ type: PongMessageType.INIT, userId: userId }));
            console.log("Sent userId to server: ", userId);
        } else {
            console.warn("No userId set before WebSocket connection.");
        }
    };

    socket.onmessage = (event: MessageEvent) => {
        try {
            const data: PongServerResponse = JSON.parse(event.data);
            ballX = data.ballX;
            ballY = data.ballY;
            playerY = data.player1Y;
            opponentY = data.player2Y;
            playerScore = data.scorePlayer1;
            opponentScore = data.scorePlayer2;
            draw();
        } catch (err) {
            console.error("Failed to parse game state:", err);
        }
        if (keys["w"] && !keys["s"]) {
            socket?.send(JSON.stringify({ type: PongMessageType.MOVE, move: PongClientMove.UP }));
        } else if (keys["s"] && !keys["w"]) {
            socket?.send(JSON.stringify({ type: PongMessageType.MOVE, move: PongClientMove.DOWN }));
        }
    };
};

// Initial connection
const sendIDButton = document.getElementById("sendIDButton") as HTMLButtonElement;

sendIDButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const userId = (document.getElementById("user-id") as HTMLInputElement).value;
    // console.log("User ID:", userId);

    if (!userId) {
        alert("Please enter a valid user ID.");
        return;
    }

    sendIDButton.disabled = true;
    connectWebSocket(userId);
});

