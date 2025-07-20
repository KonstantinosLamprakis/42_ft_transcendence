// This file contains all the types and enums used by backend endpoints, which are used by the frontend.

export const SERVER_HOST = typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
export const WEBSOCKET_API_URL = `wss://${SERVER_HOST}/api`;
export const HTTPS_API_URL = `https://${SERVER_HOST}/api`;

// pong
export enum PongMessageType {
	INIT = "init",
	MOVE = "move",
	END = "end",
	DRAW = "draw",
	START = "start",
};

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
	type: PongMessageType;
	ballX: number;
	ballY: number;
	player1Y: number;
	player2Y: number;
	scorePlayer1: number;
	scorePlayer2: number;
	winner?: number;
	userNamePlayer1?: string;
	userNamePlayer2?: string;
};

// auth
export type meResponse = {
	id: string;
	username: string;
	name: string;
	nickname: string;
	email: string;
	avatar: string | undefined;
	wins: number;
	loses: number;
	isGoogleAccount: boolean | undefined;
	matches: Match[];
}

export type Match = {
	user1_score: string;
	user2_score: string;
	match_date: string;
	opponent_username: string;
	winner_username: string;
}