// This file contains all the types and enums used by backend endpoints, which are used by the frontend.

export const API_REST_GATEWAY_PORT = 3000;
export const SERVER_HOST = typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
export const WEBSOCKET_SERVER_URL = `wss://${SERVER_HOST}:${API_REST_GATEWAY_PORT}`;
export const HTTPS_SERVER_URL = `https://${SERVER_HOST}:${API_REST_GATEWAY_PORT}`;

// live-chat
export enum ChatMessageType {
	STATUS = "status",
	CHAT_MESSAGE = "chatMessage",
	NAME_UPDATE = "nameUpdate",
}

export type ChatServerResponse = {
	type: ChatMessageType;
	content: string;
	timestamp: number;
	name: string;
	senderId: string;
};
