import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { WebSocket } from "ws";

const fastify = Fastify({ logger: true });
fastify.register(websocket);

const onlineUsers = new Map<string, Set<WebSocket>>();

fastify.register(async (fastify) => {
    fastify.get("/online-status", { websocket: true }, (socket: WebSocket, req) => {

        let userId: string | undefined;
        if (req.query && typeof req.query === 'object' && 'userId' in req.query) {
            userId = req.query.userId as string;
        }
        
        if (!userId) {
            fastify.log.warn('WebSocket connection rejected - missing userId in query params');
            socket.close(1008, 'userId required');
            return;
        }

        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set<WebSocket>())
        }
        onlineUsers.get(userId)?.add(socket);

        socket.on("close", () => {
            const userSockets = onlineUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket);
                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);
                }
            }
        });

        socket.on("error", (error) => {
            console.error(`WebSocket error for user ${userId}:`, error);
            const userSockets = onlineUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket);
                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);
                }
            }
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