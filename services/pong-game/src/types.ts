// This file contains all the types and enums used by backend endpoints.

export const SERVER_HOST = typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
export const WEBSOCKET_API_URL = `wss://${SERVER_HOST}/api`;
export const HTTPS_API_URL = `https://${SERVER_HOST}/api`;

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
};

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

export enum Runtime {
	LOCAL = "local",
	DOCKER = "docker",
};
