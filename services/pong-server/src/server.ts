import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { v4 as uuidv4 } from 'uuid';

const fastify = Fastify();
fastify.register(websocket);

type GameRoom = {
sockets: WebSocket[];
pingInterval?: NodeJS.Timer;
};

const gameRooms = new Map<string, GameRoom>();

// === 1. HTTP Route to Join a Game ===
fastify.get('/join', async (req, reply) => {
// Try to find a game with only 1 player
let targetRoom: string | null = null;

for (const [gameId, room] of gameRooms) {
	if (room.sockets.length === 1) {
	targetRoom = gameId;
	break;
	}
}

// create new game
if (!targetRoom) {
	targetRoom = uuidv4();
	gameRooms.set(targetRoom, { sockets: [] });
}

// Redirect to game page
return reply.redirect(`/game/${targetRoom}`);
});

// === 2. Serve Game Page ===
fastify.get('/game/:gameId', async (req, reply) => {
const { gameId } = req.params as { gameId: string };
return reply.type('text/html').send(`
	<!DOCTYPE html>
	<html>
	<body>
		<h1>Game ID (v4): ${gameId}</h1>
		<div id="status"></div>
		<script>
		const gameId = "${gameId}";
		const status = document.getElementById("status");

		function log(msg) {
			console.log(msg);
			const p = document.createElement("p");
			p.textContent = msg;
			status.appendChild(p);
		}

		log("Connecting to game " + gameId + "...");

		const ws = new WebSocket("ws://" + location.host + "/ws/" + gameId);

		ws.onopen = () => {
			log("Connected to game " + gameId);
			ws.send("Player connected");
		};

		ws.onmessage = (e) => {
			log("Server: " + e.data);
		};

		ws.onerror = (e) => {
			log("WebSocket error occurred.");
			console.error("WebSocket error:", e);
		};

		ws.onclose = (e) => {
			log("WebSocket closed. Code: " + e.code + ", Reason: " + e.reason);
		};
		</script>
	</body>
	</html>
`);
});


// === 3. WebSocket route ===
fastify.get<{ Params: { gameId: string } }>('/ws/:gameId', { websocket: true }, (conn, reply) => {

	const gameId = conn.params.gameId;
	console.log("ID: " + gameId); 
	
	const room = gameRooms.get(gameId);
	if (!room) {
		console.log("Tried to join invalid room.");
		try {
			conn.socket.send('Invalid game ID');
		} catch (e) {
			// socket might already be closed, ignore
		}
		setTimeout(() => conn.socket.close(1008, 'Invalid game ID'), 100); // 1008 = Policy Violation
		return;
	}

	room.sockets.push(conn.socket);
	console.log(`Player joined room ${gameId} (${room.sockets.length}/2)`);
	conn.socket.send(`You joined game ${gameId}. Waiting for another player...`);

	if (!room.pingInterval) {
		room.pingInterval = setInterval(() => {
		room.sockets.forEach(s => {
		if (s.readyState === s.OPEN) {
			s.send(JSON.stringify({ type: 'ping' }));
		}
		});
		}, 30_000); // every 30 seconds
	}

	if (room.sockets.length === 2) {
	// Notify both players the game is starting
	room.sockets.forEach(socket => {
	socket.send(`Both players connected. Game starting!`);
	});
	}

	conn.socket.on('close', () => {
	console.log(`Player disconnected from room ${gameId}`);
	room.sockets = room.sockets.filter(s => s !== conn.socket);
	if (room.sockets.length === 0) {
	gameRooms.delete(gameId);
	console.log(`Room ${gameId} cleaned up`);
	}
	});

	conn.socket.on('error', (err: Error) => {
		console.error('WebSocket server socket error:', err);
	});

});

// === 4. Start server ===
const start = async () => {
try {
	await fastify.listen({ port: 3000 });
	console.log('Server listening on http://localhost:3000');
} catch (err) {
	console.error(err);
	process.exit(1);
}
};

start();
