import { WEBSOCKET_API_URL } from "../types.js";
import { getToken } from "../token.js";

let socket: WebSocket | null = null;
let MAX_RETRIES = 5;
let retryCount = 0;

function getUserIdFromToken(): { userId: string } | null {
    const token = getToken();
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { userId: payload.id };
    } catch (error) {
        // console.error('Failed to decode token:', error);
        return null;
    }
}

export function connectSocket() {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

    const result = getUserIdFromToken();
    const token = getToken();
    if (!result || !result.userId || !token) {
        // console.log("No user ID or token found");
        return;
    }
    const { userId } = result;

    socket = new WebSocket(`${WEBSOCKET_API_URL}/online-status?userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`);

    socket.onopen = () => {
        retryCount = 0;
        // console.log("Online status WebSocket connected");
    };

    socket.onclose = () => {
        // console.log("WebSocket disconnected — retrying in 2s");
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(connectSocket, 2000);
        }
        socket = null;
    };

    socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        socket?.close();
    };
}

export function disconnectSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}

