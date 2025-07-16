import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { randomUUID } from "crypto";

enum ChatMessageType {
	STATUS = "status",
	CHAT_MESSAGE = "chatMessage",
	NAME_UPDATE = "nameUpdate",
}

type ChatServerResponse = {
	type: ChatMessageType;
	content: string;
	timestamp: number;
	name: string;
	senderId: string;
};

const fastify = Fastify();
fastify.register(websocket);

interface Connection {
	id: string;
	name: string;
	socket: any;
}

const connections = new Map<string, Connection>();

fastify.addHook("onRequest", (request, reply, done) => {
	if (request.raw.url?.startsWith("/chat") && request.raw.headers.upgrade === "websocket") {
		fastify.log.info(`WebSocket request for /chat from ${request.ip}`);
	}
	done();
});

fastify.register(async function (fastify) {
	fastify.get("/chat", { websocket: true }, (socket, req) => {
		const connId = randomUUID();
		let userName = "Anonymous";

		connections.set(connId, { id: connId, name: userName, socket });

		// Send welcome and assign ID
		const payload: ChatServerResponse = {
			type: ChatMessageType.STATUS,
			content: `Welcome! Your ID: ${connId}`,
			name: connections.get(connId)?.name || "Anonymous",
			timestamp: Date.now(),
			senderId: connId,
		};
		socket.send(JSON.stringify(payload));

		socket.on("message", (message: Buffer) => {
			let parsed;
			try {
				parsed = JSON.parse(message.toString());
			} catch (e) {
				fastify.log.warn("Invalid JSON from client:", message.toString());
				return;
			}

			if (parsed.type === ChatMessageType.CHAT_MESSAGE && parsed.senderId && parsed.text) {
				const senderConn = connections.get(parsed.senderId);
				const senderName = senderConn ? senderConn.name : "Anonymous";
				const chatPayload: ChatServerResponse = {
					type: ChatMessageType.CHAT_MESSAGE,
					name: connections.get(parsed.senderId)?.name || "Anonymous",
					content: parsed.text,
					timestamp: parsed.timestamp || Date.now(),
					senderId: connId,
				};
				// Broadcast to all clients
				connections.forEach((conn) => {
					conn.socket.send(JSON.stringify(chatPayload));
				});
				fastify.log.info(`Broadcasted message from ${senderName}: ${parsed.text}`);
			} else if (
				parsed.type === ChatMessageType.NAME_UPDATE &&
				parsed.senderId &&
				parsed.name
			) {
				const conn = connections.get(parsed.senderId);
				if (conn) {
					conn.name = parsed.name;
					const nameUpdatePayload: ChatServerResponse = {
						type: ChatMessageType.NAME_UPDATE,
						name: connections.get(parsed.senderId)?.name || "Anonymous",
						content: parsed.text,
						timestamp: parsed.timestamp || Date.now(),
						senderId: connId,
					};
					connections.forEach((conn) => {
						conn.socket.send(JSON.stringify(nameUpdatePayload));
					});
					fastify.log.info(`User ${parsed.senderId} updated name to: ${parsed.name}`);
				}
			}
		});

		socket.on("close", () => {
			const disconnectPayload: ChatServerResponse = {
				type: ChatMessageType.STATUS,
				content: `User ${connections.get(connId)?.name || "Anonymous"} disconnected.`,
				name: connections.get(connId)?.name || "Anonymous",
				timestamp: Date.now(),
				senderId: connId,
			};
			connections.delete(connId);
			connections.forEach((conn) => conn.socket.send(JSON.stringify(disconnectPayload)));
			fastify.log.info(`Client disconnected: ${connId}`);
		});

		socket.on("error", (err: any) => {
			fastify.log.error(`WebSocket error for ${connId}: ${err.message}`);
		});
	});
});

fastify.listen({ port: 3003, host: "0.0.0.0" });
