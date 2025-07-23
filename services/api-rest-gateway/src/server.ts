import Fastify from "fastify";
import fastifyHttpProxy from "@fastify/http-proxy";
import * as dotenv from "dotenv";
import axios from "axios";

dotenv.config();

enum Runtime {
	LOCAL = "local",
	DOCKER = "docker",
}

const fastify = Fastify();

const AUTH_SERVICE_URL = 
    process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:5000" : "http://auth:5000";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
    "/login",
    "/signup", 
    "/google-login",
	"/2fa",
	"/uploads"
];

const authenticateToken = async (request: any, reply: any) => {
    try {
        // Skip authentication for public routes
        const isPublicRoute = PUBLIC_ROUTES.some(route => request.url.startsWith(route));
        if (isPublicRoute) {
            return;
        }

		let token;
		if (request.raw.headers.upgrade !== 'websocket') {
			token = request.headers.authorization?.split(' ')[1];
    	} else {
			if (request.query && typeof request.query === 'object' && 'token' in request.query) {
				token = request.query.token as string;
			}
		}

        if (!token) {
            return reply.status(401).send({ error: 'Access token required' });
        }

        // Validate token with auth service
        const authResponse = await axios.get(`${AUTH_SERVICE_URL}/validate-token`, {
            headers: { Authorization: `Bearer ${token}` }
        });

		let userId;
		if (request.query && typeof request.query === 'object' && 'userId' in request.query) {
			userId = request.query.userId as string;
		}

		if (userId && userId !== authResponse.data.user.id.toString()) {
			fastify.log.warn(`User ID mismatch: ${userId} does not match authenticated user ID ${authResponse.data.user.id}`);
			return reply.status(403).send({ error: 'Forbidden: User ID mismatch' });
		}

        // Forward user context to internal services
        request.headers['x-user-id'] = authResponse.data.user.id.toString();
        request.headers['x-username'] = authResponse.data.user.username;
        request.user = authResponse.data.user;
        
        fastify.log.info(`Authenticated user: ${authResponse.data.user.username}-${authResponse.data.user.id.toString()} for ${request.url}`);
        
    } catch (error: any) {
        fastify.log.error('Token validation failed:', error.message);
        return reply.status(401).send({ error: 'Invalid or expired token' });
    }
};

fastify.addHook('preHandler', authenticateToken);

const proxyConfigs = [
	// auth
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:5000" : "http://auth:5000",
		prefix: "/me",
		rewritePrefix: "/me",
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:5000" : "http://auth:5000",
		prefix: "/update-user",
		rewritePrefix: "/update-user",
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:5000" : "http://auth:5000",
		prefix: "/login",
		rewritePrefix: "/login",
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:5000" : "http://auth:5000",
		prefix: "/signup",
		rewritePrefix: "/signup",
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:5000" : "http://auth:5000",
		prefix: "/uploads/",
		rewritePrefix: "/uploads/",
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:5000" : "http://auth:5000",
		prefix: "/2fa/setup",
		rewritePrefix: "/2fa/setup",
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:5000" : "http://auth:5000",
		prefix: "/2fa/activate",
		rewritePrefix: "/2fa/activate",
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:5000" : "http://auth:5000",
		prefix: "/2fa/verify",
		rewritePrefix: "/2fa/verify",
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:5000" : "http://auth:5000",
		prefix: "/google-login",
		rewritePrefix: "/google-login",
	},

	// pong
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "ws://127.0.0.1:5003" : "ws://pong-game:5003",
		prefix: "/pong",
		rewritePrefix: "/pong",
		websocket: true,
	},

	// online-status
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "ws://127.0.0.1:6000" : "ws://online-status:6000",
		prefix: "/online-status",
		rewritePrefix: "/online-status",
		websocket: true,
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:6000" : "http://online-status:6000",
		prefix: "/check-online-users",
		rewritePrefix: "/check-online-users",
	},

	//sql
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:4000" : "http://sqlite-db:4000",
		prefix: "/add-friend",
		rewritePrefix: "/add-friend",
	},
	{
		upstream:
			process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:4000" : "http://sqlite-db:4000",
		prefix: "/remove-friend",
		rewritePrefix: "/remove-friend",
	},
];

for (const cfg of proxyConfigs) {
	fastify.register(fastifyHttpProxy, {
		upstream: cfg.upstream,
		prefix: cfg.prefix,
		rewritePrefix: cfg.rewritePrefix,
		websocket: cfg.websocket ?? false,
		replyOptions: {
            rewriteRequestHeaders: (originalReq, headers) => {
                return headers;
            }
        }
	});
}

fastify.listen({ port: 3000, host: "0.0.0.0" }, function (err, address) {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
});
