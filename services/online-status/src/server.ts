import Fastify from "fastify";
import websocket from "@fastify/websocket";
import type { WebSocket } from "ws";

const fastify = Fastify({ logger: true });
fastify.register(websocket);

const onlineUsers = new Map<string, WebSocket>();

// fastify.addHook("onRequest", (request, reply, done) => {
//     fastify.log.info(`WebSocket request from ${request.ip}`);
//     done();
// });

fastify.register(async (fastify) => {
    fastify.get("/online-status", { websocket: true }, (socket: WebSocket, req) => {

        let userId: string 
        if (req.query && typeof req.query === 'object' && 'userId' in req.query) {
            userId = req.query.userId as string;
        }
        
        if (!userId) {
            fastify.log.warn('WebSocket connection rejected - missing userId in query params');
            socket.close(1008, 'userId required');
            return;
        }

        onlineUsers.set(userId, socket);
        // fastify.log.info(`User ${userId} is online. Total users: ${onlineUsers.size}`);

        socket.on("close", () => {
            onlineUsers.delete(userId);
            // fastify.log.info(`User ${userId} disconnected. Total users: ${onlineUsers.size}`);
        });

        socket.on("error", (error) => {
            console.error(`WebSocket error for user ${userId}:`, error);
            onlineUsers.delete(userId);
        });
    });
});

fastify.get("/check-online-users", async (request, reply) => {
    try {
        const { userIds } = request.query as { userIds: string };

        if (!userIds) {
            return reply.status(400).send({ error: "userIds parameter required" });
        }

        const userIdArray = userIds.split(',');
        const onlineStatus: Record<string, boolean> = {};

        userIdArray.forEach(userId => {
            onlineStatus[userId.trim()] = onlineUsers.has(userId.trim());
        });

        return { onlineStatus };
    } catch (err) {
        request.log.error("Error checking online users:", err);
        return reply.status(500).send({ error: "Internal server error" });
    }
});


fastify.listen({ port: 6000, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`online-status service listening at ${address}`);
});