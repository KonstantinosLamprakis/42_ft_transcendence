// types.ts
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
}

export type PongServerResponse = {
	ballX: number;
	ballY: number;
	player1Y: number;
	player2Y: number;
	scorePlayer1: number;
	scorePlayer2: number;
}
