import { WEBSOCKET_API_URL, PongClientMove, meResponse, PongMessageType } from "../types.js";
import { getToken, fetchUser } from "../token.js";

export const gamePage = (pageContainer: HTMLElement) => {
	pageContainer.innerHTML = `
        <div class="min-h-screen bg-background-color text-foreground-color p-4 sm:p-6 lg:p-8">
            <!-- Header Section -->
            <div class="max-w-6xl mx-auto">
                <div class="text-center mb-8">
                    <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground-color mb-2">
                        Pong Tournament
                    </h1>
                    <p class="text-gray-600 text-sm sm:text-base lg:text-lg">
                        Real-time multiplayer Pong game
                    </p>
                </div>

                <!-- Game Area -->
                <div class="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                    <!-- Game Stats -->
                    <div class="bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="text-center">
									<div id="player1Nickname" class="text-xs sm:text-base text-gray-400 font-bold">Nickname 1</div>
									<div class="text-lg sm:text-xl font-bold text-white" id="player-score">0</div>
                                </div>
                                <div class="text-gray-500 text-lg sm:text-xl font-bold">VS</div>
                                <div class="text-center">
									<div id="player2Nickname" class="text-xs sm:text-base text-gray-400 font-bold">Nickname 2</div>
									<div class="text-lg sm:text-xl font-bold text-white" id="opponent-score">0</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse" id="connection-status"></div>
                                <span id="connection-text">Connecting...</span>
                            </div>
                        </div>
                    </div>

                    <!-- Canvas Container -->
                    <div class="relative bg-black flex items-center justify-center" style="min-height: 300px;">
                        <canvas 
                            id="game" 
                            width="800" 
                            height="500" 
                            class="max-w-full h-auto border-2 border-gray-700 rounded-lg">
                        </canvas>
                        
                        <!-- Loading State -->
                        <div id="game-loading" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div class="text-center text-white">
                                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                                <p class="text-lg font-medium">Waiting for opponent...</p>
                                <p class="text-sm text-gray-400 mt-2">Make sure both players have entered the game</p>
                            </div>
                        </div>
                    </div>

                    <!-- Game Controls Info -->
                    <div class="bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-700">
                        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div class="flex items-center gap-6 text-sm text-gray-400">
                                <div class="flex items-center gap-2">
                                    <kbd class="px-2 py-1 bg-gray-700 rounded text-xs">W</kbd>
                                    <span>Move Up</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <kbd class="px-2 py-1 bg-gray-700 rounded text-xs">S</kbd>
                                    <span>Move Down</span>
                                </div>
                            </div>
							<div>
								<button 
									id="disconnect-btn" 
									class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
									disabled>
									Disconnect
								</button>
								<button 
									id="start-game" 
									class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
									<span class="flex items-center justify-center gap-2">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1"></path>
										</svg>
										Start Game
									</span>
								</button>
								<button 
									id="start-tournament" 
									class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
									<span class="flex items-center justify-center gap-2">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1"></path>
										</svg>
										Tournament
									</span>
								</button>
							</div>
                        </div>
                    </div>
                </div>

                <!-- Game Instructions -->
                <div class="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                    <h3 class="text-lg font-semibold text-blue-900 mb-3">How to Play</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 text-sm text-blue-800">
                        <div class="flex items-start gap-3">
                            <div class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                            <p>Wait for another player to join the match</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                            <p>Use W/S keys to control your paddle and score goals!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

	let socket: WebSocket | null = null;

	const canvas = document.getElementById("game") as HTMLCanvasElement;
	const ctx = canvas.getContext("2d")!;
	const loadingDiv = document.getElementById("game-loading") as HTMLElement;
	const connectionStatus = document.getElementById("connection-status") as HTMLElement;
	const connectionText = document.getElementById("connection-text") as HTMLElement;
	const playerScoreEl = document.getElementById("player-score") as HTMLElement;
	const opponentScoreEl = document.getElementById("opponent-score") as HTMLElement;
	const disconnectBtn = document.getElementById("disconnect-btn") as HTMLButtonElement;

	// Responsive canvas sizing
	function resizeCanvas() {
		const container = canvas.parentElement!;
		const containerWidth = container.clientWidth;
		const maxWidth = Math.min(800, containerWidth - 32); // 32px for padding
		const aspectRatio = 800 / 500;
		const newHeight = maxWidth / aspectRatio;

		canvas.style.width = `${maxWidth}px`;
		canvas.style.height = `${newHeight}px`;
	}

	// Initial resize and add listener
	resizeCanvas();
	window.addEventListener("resize", resizeCanvas);

	const WIDTH = canvas.width;
	const HEIGHT = canvas.height;

	const PADDLE_WIDTH = 10;
	const PADDLE_HEIGHT = 100;
	const BALL_SIZE = 5;

	let playerY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
	let opponentY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
	let ballX = WIDTH / 2;
	let ballY = HEIGHT / 2;

	let playerScore = 0;
	let opponentScore = 0;

	let keys: Record<string, boolean> = {};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "w" || e.key === "s") {
			e.preventDefault(); // Prevent page scrolling
		}
		keys[e.key] = true;
	};

	const handleKeyUp = (e: KeyboardEvent) => {
		keys[e.key] = false;
	};

	function drawCircle(x: number, y: number, r: number, color = "white") {
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();
	}

	function draw() {
		// Clear canvas with gradient background
		const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
		gradient.addColorStop(0, "#1a1a2e");
		gradient.addColorStop(1, "#16213e");
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, WIDTH, HEIGHT);

		// Draw center line
		ctx.setLineDash([10, 10]);
		ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(WIDTH / 2, 0);
		ctx.lineTo(WIDTH / 2, HEIGHT);
		ctx.stroke();
		ctx.setLineDash([]);

		// Draw paddles with rounded corners
		ctx.fillStyle = "#4ade80"; // Green for player
		ctx.fillRect(5, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

		ctx.fillStyle = "#f87171"; // Red for opponent
		ctx.fillRect(WIDTH - PADDLE_WIDTH - 5, opponentY, PADDLE_WIDTH, PADDLE_HEIGHT);

		// Draw ball with glow effect
		ctx.shadowColor = "white";
		ctx.shadowBlur = 10;
		drawCircle(ballX, ballY, BALL_SIZE, "white");
		ctx.shadowBlur = 0;

		// Update UI scores
		playerScoreEl.textContent = playerScore.toString();
		opponentScoreEl.textContent = opponentScore.toString();
	}

	function drawBracket(user1 : string, user2: string, user3: string, user4: string) {
	const centerX = WIDTH / 2;
	const startY = 100;
	const spacingY = 80;
	const boxWidth = 140;
	const boxHeight = 40;

	// Helper to draw glowing text boxes
	function drawBox(x: number, y: number, text: string, color: string) {
		ctx.fillStyle = color;
		ctx.shadowColor = color;
		ctx.shadowBlur = 10;
		ctx.fillRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight);

		ctx.shadowBlur = 0;
		ctx.fillStyle = "white";
		ctx.font = "16px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(text, x, y);
	}

	// Draw brackets and lines
	const match1Y1 = startY;
	const match1Y2 = startY + spacingY;
	const match1MidY = (match1Y1 + match1Y2) / 2;

	const match2Y1 = startY + 3 * spacingY;
	const match2Y2 = startY + 4 * spacingY;
	const match2MidY = (match2Y1 + match2Y2) / 2;

	const finalMatchY = (match1MidY + match2MidY) / 2;

	// Match 1
	drawBox(centerX - 200, match1Y1, user1, "#4ade80"); // Green
	drawBox(centerX - 200, match1Y2, user2, "#f87171"); // Red

	// Line to match1 mid
	ctx.strokeStyle = "white";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(centerX - 130, match1Y1);
	ctx.lineTo(centerX - 100, match1MidY);
	ctx.lineTo(centerX - 130, match1Y2);
	ctx.stroke();

	// Match 2
	drawBox(centerX - 200, match2Y1, user3, "#4ade80");
	drawBox(centerX - 200, match2Y2, user4, "#f87171");

	// Line to match2 mid
	ctx.beginPath();
	ctx.moveTo(centerX - 130, match2Y1);
	ctx.lineTo(centerX - 100, match2MidY);
	ctx.lineTo(centerX - 130, match2Y2);
	ctx.stroke();

	// Final match box
	drawBox(centerX + 140, finalMatchY, "???", "#60a5fa"); // Blue for final placeholder

	// Connect match 1 to final
	ctx.beginPath();
	ctx.moveTo(centerX - 100, match1MidY);
	ctx.lineTo(centerX, match1MidY);
	ctx.lineTo(centerX, finalMatchY);
	ctx.lineTo(centerX + boxWidth / 2, finalMatchY);
	ctx.stroke();

	// Connect match 2 to final
	ctx.beginPath();
	ctx.moveTo(centerX - 100, match2MidY);
	ctx.lineTo(centerX, match2MidY);
	ctx.lineTo(centerX, finalMatchY);
	ctx.stroke();
}


function updateConnectionStatus(status: "connecting" | "connected" | "disconnected") {
	const statusMap = {
		connecting: {
			color: "bg-yellow-500",
			text: "Connecting...",
			animation: "animate-pulse",
		},
		connected: { color: "bg-green-500", text: "Connected", animation: "" },
		disconnected: { color: "bg-red-500", text: "Disconnected", animation: "animate-pulse" },
	};
	
	const { color, text, animation } = statusMap[status];
	connectionStatus.className = `w-2 h-2 ${color} rounded-full ${animation}`;
	connectionText.textContent = text;
}

// Event listeners
const startGameButton = document.getElementById("start-game") as HTMLButtonElement;
const startTournamentButton= document.getElementById("start-tournament") as HTMLButtonElement;

function connectWebSocket(user: meResponse | undefined, tournament : boolean): void {
	const token = getToken();
	if (!token) {
		console.error("No authentication token found");
		return;
	}
	
	updateConnectionStatus("connecting");
	loadingDiv.style.display = "flex";
	
	socket = new WebSocket(
		`${WEBSOCKET_API_URL}/pong?userId=${encodeURIComponent(user?.id ?? "")}&token=${encodeURIComponent(token)}`,
	);
	
	
	socket.onopen = (event: Event) => {
		console.log("WebSocket connected:", event);
			updateConnectionStatus("connected");
			disconnectBtn.disabled = false;

			if (token) {
				if (!tournament){
					socket?.send(JSON.stringify({ type: PongMessageType.INIT }));
				}
				else{
					socket?.send(JSON.stringify({ type: PongMessageType.TOURNAMENT }));
				}
				console.log("Sent userId to server: ", token);
			} else {
				console.warn("No userId set before WebSocket connection.");
			}
		};

		socket.onmessage = (event: MessageEvent) => {
			let data: any;

			try {
				data = JSON.parse(event.data);

				if (data.type === PongMessageType.END) {
					playerScore = data.scorePlayer1;
					opponentScore = data.scorePlayer2;
					draw();

					// Enhanced game over modal
					const winner = data.winner === user?.id ? "You Won!" : "You Lost!";
					const winnerClass =
						data.winner === user?.id ? "text-green-600" : "text-red-600";

					pageContainer.insertAdjacentHTML(
						"beforeend",
						`
                        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="game-over-modal">
                            <div class="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
                                <h2 class="text-2xl font-bold ${winnerClass} mb-4">${winner}</h2>
                                <p class="text-gray-600 mb-6">Final Score: ${data.scorePlayer1} - ${data.scorePlayer2}</p>
                                <button onclick="document.getElementById('game-over-modal').remove()" 
                                    class="px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:bg-opacity-90 transition-colors">
                                    Close
                                </button>
                            </div>
                        </div>
                    `,
					);

					socket?.close();
					updateConnectionStatus("disconnected");
					disconnectBtn.disabled = true;
					startGameButton.disabled = false;
					startTournamentButton.disabled = false;
					loadingDiv.style.display = "flex";
					return;
				}

				if (data.type === PongMessageType.T_STAT) {
					loadingDiv.style.display = "none";
					drawBracket(data.usernamePlayer1, data.usernamePlayer2, data.usernamePlayer3, data.usernamePlayer4);
				}

				if (data.type === PongMessageType.T_END) {
					playerScore = data.scorePlayer1;
					opponentScore = data.scorePlayer2;
					draw();

					// Enhanced game over modal
					const winner = data.winner === user?.id ? "You Won!" : "You're OUT'!";
					const winnerClass =
						data.winner === user?.id ? "text-green-600" : "text-red-600";

					document.getElementById("game-over-modal")?.remove(); // prevent duplicate modals

					pageContainer.insertAdjacentHTML(
					"beforeend",
					`
					<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="game-over-modal">
						<div class="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
							<h2 class="text-2xl font-bold ${winnerClass} mb-4">${winner}</h2>
							<p class="text-gray-600 mb-6">Final Score: ${data.scorePlayer1} - ${data.scorePlayer2}</p>
							<p class="text-gray-600 mb-6">This tournament is over.</p>
							<button onclick="document.getElementById('game-over-modal').remove()" 
								class="px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:bg-opacity-90 transition-colors">
								Close
							</button>
						</div>
                    </div>
					`,
					);


					socket?.close();
					updateConnectionStatus("disconnected");
					disconnectBtn.disabled = true;
					startGameButton.disabled = false;
					startTournamentButton.disabled = false;
					loadingDiv.style.display = "flex";
					return;
				}

				if (data.type === PongMessageType.T_CONTINUE) {
					playerScore = data.scorePlayer1;
					opponentScore = data.scorePlayer2;
					draw();

					// Enhanced game over modal
					const winner = data.winner === user?.id ? "You Won! Please wait for the next match" : "You're OUT''!";
					const winnerClass =
						data.winner === user?.id ? "text-green-600" : "text-red-600";

					pageContainer.insertAdjacentHTML(
						"beforeend",
						`
                        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="game-over-modal">
                            <div class="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
                                <h2 class="text-2xl font-bold ${winnerClass} mb-4">${winner}</h2>
                                <p class="text-gray-600 mb-6">Score: ${data.scorePlayer1} - ${data.scorePlayer2}</p>
                                <p class="text-gray-600 mb-6">Only the WINNER moves on to the next round!</p>
                                <p class="text-gray-600 mb-6">Please wait patiently for the next match</p>
                                <button onclick="document.getElementById('game-over-modal').remove()" 
                                    class="px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:bg-opacity-90 transition-colors">
                                    Close
                                </button>
                            </div>
                        </div>
                    `,
					);

					if (data.winner !== user?.id)
						socket?.close();
					else {
						setTimeout(() => {
							document.getElementById("game-over-modal")?.remove();
						}, 2500);
					}
					return;
				}

				if (data.type === PongMessageType.START) {
					loadingDiv.style.display = "none";
					ballX = data.ballX;
					ballY = data.ballY;
					playerY = data.player1Y;
					opponentY = data.player2Y;
					playerScore = data.scorePlayer1;
					opponentScore = data.scorePlayer2;
					document.getElementById("player1Nickname")!.textContent = data.nicknamePlayer1;
					document.getElementById("player2Nickname")!.textContent = data.nicknamePlayer2;
					document.getElementById("player1")!.textContent = data.usernamePlayer1;
					document.getElementById("player2")!.textContent = data.usernamePlayer2;
					draw();
				}

				if (data.type === PongMessageType.DRAW) {
					loadingDiv.style.display = "none";
					ballX = data.ballX;
					ballY = data.ballY;
					playerY = data.player1Y;
					opponentY = data.player2Y;
					playerScore = data.scorePlayer1;
					opponentScore = data.scorePlayer2;
					draw();
				}
			} catch (err) {
				console.error("Failed to parse message from server:", err);
				return;
			}

			if (keys["w"] && !keys["s"]) {
				socket?.send(
					JSON.stringify({ type: PongMessageType.MOVE, move: PongClientMove.UP }),
				);
			} else if (keys["s"] && !keys["w"]) {
				socket?.send(
					JSON.stringify({ type: PongMessageType.MOVE, move: PongClientMove.DOWN }),
				);
			}
		};

		socket.onclose = () => {
			updateConnectionStatus("disconnected");
			disconnectBtn.disabled = true;
			startGameButton.disabled = false;
			startTournamentButton.disabled = false;
			loadingDiv.style.display = "flex";
		};

		socket.onerror = (error) => {
			console.error("WebSocket error:", error);
			updateConnectionStatus("disconnected");
		};
	}


	const handleStartGameClick = async (e: MouseEvent) => {
		e.preventDefault();
		const user = await fetchUser();
		startGameButton.disabled = true;
		startTournamentButton.disabled = true;
		connectWebSocket(user, false);
	};
	const handleStartTournamentClick = async (e: MouseEvent) => {
		e.preventDefault();
		const user = await fetchUser();
		startGameButton.disabled = true;
		startTournamentButton.disabled = true;
		connectWebSocket(user, true);
	};

	const handleDisconnectClick = () => {
		if (socket) {
			socket.close();
			socket = null;
			startGameButton.disabled = false;
			startTournamentButton.disabled = false;
			updateConnectionStatus("disconnected");
			loadingDiv.style.display = "flex";
		}
	};

	startGameButton.addEventListener("click", handleStartGameClick);
	startTournamentButton.addEventListener("click", handleStartTournamentClick);
	disconnectBtn.addEventListener("click", handleDisconnectClick);
	document.addEventListener("keyup", handleKeyUp);
	document.addEventListener("keydown", handleKeyDown);

	(pageContainer as any)._cleanupListeners = () => {
		startGameButton.removeEventListener("click", handleStartGameClick);
		startTournamentButton.removeEventListener("click", handleStartTournamentClick);
		disconnectBtn.removeEventListener("click", handleDisconnectClick);
		window.removeEventListener("resize", resizeCanvas);
		document.removeEventListener("keyup", handleKeyUp);
		document.removeEventListener("keydown", handleKeyDown);
	};

	draw();
};
