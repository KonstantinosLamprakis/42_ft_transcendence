// This file contains all the types and enums used by backend endpoints, which are used by the frontend.

export const SERVER_HOST = typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
export const WEBSOCKET_API_URL = `wss://${SERVER_HOST}/api`;
export const HTTPS_API_URL = `https://${SERVER_HOST}/api`;

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

// pong
export enum PongMessageType {
	INIT = "init",
	MOVE = "move",
}

export enum PongClientMove {
	UP = "w",
	DOWN = "s",
}

export type PongClientRequest = {
	type: PongMessageType;
	move?: PongClientMove;
	userId?: string;
};

export type PongServerResponse = {
	ballX: number;
	ballY: number;
	player1Y: number;
	player2Y: number;
	scorePlayer1: number;
	scorePlayer2: number;
};
