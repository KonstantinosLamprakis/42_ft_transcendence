// This file contains all the types and enums used by backend endpoints, which are used by the frontend.

export const SERVER_HOST = typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
export const WEBSOCKET_API_URL = `wss://${SERVER_HOST}/api`;
export const HTTPS_API_URL = `https://${SERVER_HOST}/api`;

// pong
export enum PongMessageType {
	INIT = "init",
	TOURNAMENT = "tournament",
	T_CONTINUE = "t_continue",
	T_END = "t_end",
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
	usernamePlayer1?: string;
	usernamePlayer2?: string;
	usernamePlayer3?: string;
	usernamePlayer4?: string;
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
	friends: Friend[];
}

export type Match = {
	user1_score: string;
	user2_score: string;
	match_date: string;
	opponent_username: string;
	winner_username: string;
}

export type Friend = {
	friend_username: string;
	friend_id: string;
	is_online?: boolean;
}

export type getFriendProfileResponse = {
	username: string;
	nickname: string;
	avatar: string | undefined;
	wins: number;
	loses: number;
	matches: Match[];
}