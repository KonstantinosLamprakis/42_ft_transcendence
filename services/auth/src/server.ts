import Fastify from "fastify";
import fastifyMultipart from "@fastify/multipart";
import * as bcrypt from "bcryptjs";
import { writeFile } from "fs/promises";
import * as path from "path";
import fastifyStatic from "@fastify/static";
import { fileURLToPath } from "url";
import fastifyJwt from "@fastify/jwt";
import { existsSync, mkdirSync, statSync } from "fs";
import * as dotenv from "dotenv";
import axios from "axios";
import QRCode from "qrcode";
import { generateSecret, verifyTOTP } from "./totp.js";
import { OAuth2Client } from "google-auth-library";
import * as crypto from "crypto";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const pendingTwoFactorSessions = new Map<string, { username: string, expires: number }>();

// Clean up expired sessions periodically
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, session] of pendingTwoFactorSessions.entries()) {
        if (session.expires < now) {
            pendingTwoFactorSessions.delete(sessionId);
        }
    }
}, 60000); 

type GoogleSignUpRequest = {
	name: string;
	email: string;
	picture: string | undefined;
}

type AddUserRequest = {
	username: string;
	password: string;
	name: string;
	nickname: string;
	email: string;
	twofa_secret: string | undefined;
	avatar: string | undefined;
	isGoogleAccount: boolean | undefined;
}

type meResponse = {
	id: string;
	username: string;
	name: string;
	nickname: string;
	email: string;
	avatar: string | undefined;
	wins: number;
	loses: number;
	isGoogleAccount: boolean | undefined;
}

enum Runtime {
	LOCAL = "local",
	DOCKER = "docker",
}

type TokenPayload = {
	username: string;
	id: number;
};

dotenv.config();
const dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.JWT_SECRET) {
	console.error("FATAL: JWT_SECRET is not set in the environment.");
	process.exit(1);
}

const fastify = Fastify();

fastify.register(fastifyJwt, {
	secret: process.env.JWT_SECRET,
});

fastify.decorate("authenticate", async function (request: any, reply: any) {
	try {
		await request.jwtVerify();
	} catch (err) {
		reply.send(err);
	}
});

fastify.register(fastifyMultipart);

const SQLITE_DB_URL =
	process.env.RUNTIME === Runtime.LOCAL ? "http://127.0.0.1:4000" : "http://sqlite-db:4000";

fastify.post("/signup", async (req, reply) => {
	const parts = req.parts();
	const data: Record<string, string> = {};
	let avatarFile: any = null;

	for await (const part of parts) {
		if (part.type === "file") {
			if (!part.filename || part.filename.trim() === "") {
				continue;
			}
			
			if (part.mimetype !== "image/jpeg" && part.mimetype !== "image/png") {
				return reply.status(400).send({ error: "Only JPEG and PNG files are allowed." });
			}
			const validExtensions = [".jpg", ".jpeg", ".png"];
			if (!validExtensions.some((v) => part.filename?.toLowerCase().endsWith(v))) {
				return reply.status(400).send({ error: "Invalid file extension." });
			}
			try {
				await part.toBuffer();
			} catch (err) {
				return reply.status(400).send({ error: "File is corrupted or unreadable." });
			}
			avatarFile = part;
		} else {
			data[part.fieldname] = part.value?.toString() ?? "";
		}
	}

	if (!data.username || !data.password || !data.name) {
		return reply.status(400).send({ error: "Missing required fields" });
	}

	const res = await axios.get(
		`${SQLITE_DB_URL}/get-user-by-username/${encodeURIComponent(data.username)}`,
	);

	if (!res.data.error) {
		return reply.status(400).send({ error: "User already exists" });
	}

	try {

		let avatarName = "default.jpg";
		if (avatarFile){
			const ext = path.extname(avatarFile.filename);
			avatarName = `${data.username}${ext}`;
			
			const avatarPath =
			process.env.RUNTIME === Runtime.LOCAL
			? `uploads/${avatarName}`
			: `/data/uploads/${avatarName}`;
			const buffer = await avatarFile.toBuffer();
			await writeFile(avatarPath, buffer);
		}

		const hash = await bcrypt.hash(data.password, 10);
		const addUserReq: AddUserRequest = {
			username: data.username,
			password: hash,
			name: data.name,
			nickname: data.nickname,
			email: data.email,
			avatar: avatarName,
			twofa_secret: undefined,
			isGoogleAccount: false,
		}
		const res = await axios.post(`${SQLITE_DB_URL}/add-user`, addUserReq);

		if (res.data && res.data.id) {
			reply.send({ success: true, id: res.data.id });
		} else {
			reply.status(400).send({ error: "Failed to create user" });
		}
	} catch (error: any) {
		if (error.response && error.response.data) {
			return reply.status(400).send(error.response.data);
		}
		console.error("Error during signup:", error);
		reply.status(500).send({ error: "Internal server error" });
	}
});

fastify.get("/me", async (req, reply) => {
	try {
        const username = req.headers['x-username'] as string;
		if (!username) {
			return reply.status(404).send({ error: "Username not found" });
		}

		console.log("USERNAME " + username);
		const res = await axios.get(
			`${SQLITE_DB_URL}/get-user-by-username/${encodeURIComponent(username)}`,
		);
		const user = res.data;

		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}

		if (user.error) {
			return reply.status(404).send({ error: user.error });
		}

		if (user.avatar && !user.isGoogleAccount) {
			const avatarPath = path.join(uploadsDir, user.avatar);
			try {
				statSync(avatarPath); // throws an error if it doesn't exist
			} catch {
				user.avatar = undefined;
			}
		}

		const response: meResponse = {
			id: user.id.toString(),
			username: user.username,
			name: user.name,
			nickname: user.nickname,
			email: user.email,
			avatar: user.avatar || undefined,
			wins: user.wins,
			loses: user.loses,
			isGoogleAccount: user.isGoogleAccount ?? false,
		};
		
		reply.send(response);
	} catch (error: any) {
		console.error("Authentication error:", error);
		reply.status(401).send({ error: "Unauthorized" });
	}
});

fastify.post("/google-login", async (req, reply) => {
	const { idToken } = req.body as { idToken: string };
	if (!idToken) return reply.status(400).send({ error: "Missing Google ID token" });

	let ticket;
	try {
		ticket = await googleClient.verifyIdToken({
			idToken,
			audience: GOOGLE_CLIENT_ID,
		});
	} catch (err) {
		return reply.status(401).send({ error: "Invalid Google ID token" });
	}

	const payload: GoogleSignUpRequest = ticket.getPayload();
	if (!payload || !payload.email) {
		return reply.status(401).send({ error: "Invalid Google user" });
	}

	const username = payload.email.split("@")[0];

	// Check if user exists, else create
	const userRes = await axios.get(
		`${SQLITE_DB_URL}/get-user-by-username/${encodeURIComponent(username)}`,
	);
	let user = {id: userRes.data?.id, username: userRes.data?.username};
	if (!userRes.data || userRes.data.error) {
		const addUserReq: AddUserRequest = {
			username,
			password: "",
			name: payload.name || username,
			nickname: username,
			email: payload.email,
			twofa_secret: "",
			avatar: payload.picture || "",
			isGoogleAccount: true,
		}
		// Create user
		const createRes = await axios.post(`${SQLITE_DB_URL}/add-user`, addUserReq);
		if (!createRes.data || !createRes.data.id) {
			return reply.status(500).send({ error: "Failed to create Google user" });
		}
		user.id = createRes.data.id;
		user.username = username;
	}

	// Issue JWT
	const tokenPayload: TokenPayload = {
		username: user.username,
		id: user.id,
	};
	const jwt = fastify.jwt.sign(tokenPayload);

	reply.send({ token: jwt });
});

const uploadsDir =
	process.env.RUNTIME === Runtime.LOCAL ? path.join(dirname, "..", "uploads") : "/data/uploads";
if (!existsSync(uploadsDir)) {
	mkdirSync(uploadsDir, { recursive: true });
}

fastify.register(fastifyStatic, {
	root: uploadsDir,
	prefix: "/uploads/",
});

fastify.listen({ port: 5000, host: "0.0.0.0" }, () => {
	console.log("Auth service running at http://127.0.0.1:5000");
});

fastify.post("/2fa/setup", async (req, reply) => {
    const { username } = req.body as { username: string };
    if (!username) return reply.status(400).send({ error: "Username required" });

    try {
        const secret = generateSecret();
        
        // Set the secret but don't activate 2FA yet
        await axios.post(`${SQLITE_DB_URL}/set-2fa-secret`, {
            username,
            secret,
        });

        const otpauthUrl = `otpauth://totp/PongApp%20(${encodeURIComponent(username)})?secret=${secret}&issuer=PongApp`;
        const qr = await QRCode.toDataURL(otpauthUrl);

        reply.send({ qr, secret, requiresActivation: true });
    } catch (error: any) {
        console.error("Error setting up 2FA:", error);
        if (error.response && error.response.data) {
            return reply.status(400).send(error.response.data);
        }
        reply.status(500).send({ error: "Internal server error" });
    }
});

fastify.get("/validate-token", async (req, reply) => {
    try {
        const auth = req.headers.authorization?.split(" ")[1];
        if (!auth) {
            return reply.status(401).send({ error: "Auth header not found" });
        }

        const payload = await fastify.jwt.verify<TokenPayload>(auth);

        const res = await axios.get(
            `${SQLITE_DB_URL}/get-user-by-username/${encodeURIComponent(payload.username)}`,
        );
        const user = res.data;

        if (!user) {
            return reply.status(404).send({ error: "User not found" });
        }

        if (user.error) {
            return reply.status(404).send({ error: user.error });
        }

        // Return validated user info
        reply.send({
            valid: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                nickname: user.nickname,
                name: user.name
            }
        });
    } catch (error: any) {
        fastify.log.error('Token validation error:', error);
        reply.status(401).send({ error: "Invalid or expired token" });
    }
});

fastify.post("/2fa/activate", async (req, reply) => {
    const { username, token } = req.body as { username: string; token: string };
    if (!username || !token) return reply.status(400).send({ error: "Missing fields" });

    try {
        const res = await axios.get(
            `${SQLITE_DB_URL}/get-user-by-username/${encodeURIComponent(username)}`,
        );
        const user = res.data;
        
        if (!user || !user.twofa_secret) {
            return reply.status(400).send({ error: "2FA setup not found" });
        }

        if (user.is2FaEnabled) {
            return reply.status(400).send({ error: "2FA already activated" });
        }

        const verified = verifyTOTP(user.twofa_secret, token);
        if (!verified) {
            return reply.status(401).send({ error: "Invalid 2FA code" });
        }

        await axios.post(`${SQLITE_DB_URL}/activate-2fa`, { username });

        reply.send({ success: true, message: "2FA activated successfully" });
    } catch (error: any) {
        console.error("Error activating 2FA:", error);
        if (error.response && error.response.data) {
            return reply.status(400).send(error.response.data);
        }
        reply.status(500).send({ error: "Internal server error" });
    }
});

fastify.post("/2fa/verify", async (req, reply) => {
    const { sessionId, token } = req.body as { sessionId: string; token: string };
    if (!sessionId || !token) return reply.status(400).send({ error: "Missing fields" });

    try {
        const session = pendingTwoFactorSessions.get(sessionId);
        if (!session) {
            return reply.status(401).send({ error: "Invalid or expired session" });
        }

        if (session.expires < Date.now()) {
            pendingTwoFactorSessions.delete(sessionId);
            return reply.status(401).send({ error: "Session expired" });
        }

        const username = session.username;

        const res = await axios.get(
            `${SQLITE_DB_URL}/get-user-by-username/${encodeURIComponent(username)}`,
        );
        const user = res.data;
        
        if (!user || !user.twofa_secret) {
            return reply.status(400).send({ error: "2FA not enabled" });
        }

        if (!user.is2FaEnabled) {
            return reply.status(400).send({ error: "2FA not activated. Please complete setup first." });
        }

        const verified = verifyTOTP(user.twofa_secret, token);
        if (!verified) {
            return reply.status(401).send({ error: "Invalid 2FA code" });
        }

		pendingTwoFactorSessions.delete(sessionId);
		
        const tokenPayload: TokenPayload = {
            username: user.username,
            id: user.id,
        };
        const jwt = fastify.jwt.sign(tokenPayload);

        reply.send({ token: jwt });
    } catch (error: any) {
        console.error("Error verifying 2FA:", error);
        if (error.response && error.response.data) {
            return reply.status(400).send(error.response.data);
        }
        reply.status(500).send({ error: "Internal server error" });
    }
});

// Update login to check if 2FA is activated
fastify.post("/login", async (req, reply) => {
    const { username, password } = req.body as { username: string; password: string };

    try {
        const res = await axios.get(
            `${SQLITE_DB_URL}/get-user-by-username/${encodeURIComponent(username)}`,
        );
        const user = res.data;

        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            return reply.status(401).send({ error: "Invalid credentials" });
        }

        if (user.twofa_secret && user.is2FaEnabled) {
            console.log("2FA enabled for user:", user.username);
            
			const sessionId = crypto.randomBytes(32).toString('hex');
            const expires = Date.now() + (5 * 60 * 1000); // 5 minutes
            
            pendingTwoFactorSessions.set(sessionId, {
                username: user.username,
                expires
            });
            
            return reply.send({ 
                require2fa: true, 
                sessionId: sessionId 
            });
        }

        const tokenPayload: TokenPayload = {
            username: user.username,
            id: user.id,
        };

        const token = fastify.jwt.sign(tokenPayload);
        reply.send({ token });
    } catch (error: any) {
        if (error.response && error.response.data) {
            return reply.status(400).send(error.response.data);
        }
        console.error("Error during login:", error);
        reply.status(500).send({ error: "Internal server error" });
    }
});