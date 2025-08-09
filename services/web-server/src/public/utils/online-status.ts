import { WEBSOCKET_API_URL } from "../types.js";
import { getToken, fetchUser } from "../token.js";

let socket: WebSocket | null = null;
let retryCount = 0;

export async function connectSocket() {
	if (
		socket &&
		(socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
	)
		return;

	const result = await fetchUser();
	const token = getToken();
	if (!result || !result.id || !token) {
		return;
	}
	const userId = result.id;

	socket = new WebSocket(
		`${WEBSOCKET_API_URL}/online-status?userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`,
	);

	socket.onopen = () => {
		retryCount = 0;
	};

	socket.onclose = () => {
		socket = null;
	};

	socket.onerror = (err) => {
		console.log("WebSocket closed");
		socket?.close();
	};
}

export function disconnectSocket() {
	if (socket) {
		socket.close();
		socket = null;
	}
}
