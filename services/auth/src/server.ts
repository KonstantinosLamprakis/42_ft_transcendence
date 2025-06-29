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

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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

	const { username, password, name } = data;

	if (!username || !password || !name || !avatarFile) {
		return reply.status(400).send({ error: "Missing required fields" });
	}

	try {
		const hash = await bcrypt.hash(password, 10);
		const ext = path.extname(avatarFile.filename);
		const avatarName = `${username}${ext}`;

		const avatarPath =
			process.env.RUNTIME === Runtime.LOCAL
				? `uploads/${avatarName}`
				: `/data/uploads/${avatarName}`;
		const buffer = await avatarFile.toBuffer();
		await writeFile(avatarPath, buffer);

		const res = await axios.post(`${SQLITE_DB_URL}/add-user`, {
			username,
			password: hash,
			name,
			avatar: avatarName,
		});

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

		if (user.twofa_secret) {
			// Require 2FA code from client (do not issue JWT yet)
			return reply.send({ require2fa: true });
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

fastify.get("/me", async (req, reply) => {
	try {
		// extract value from header: Authorization: Bearer <JWT_TOKEN>
		const auth = req.headers.authorization?.split(" ")[1];
		if (!auth) {
			return reply.status(999).send({ error: "Auth header not found" });
		}
		const payload = await fastify.jwt.verify<TokenPayload>(auth);

		const res = await axios.get(
			`${SQLITE_DB_URL}/get-user-by-username/${encodeURIComponent(payload.username)}`,
		);
		const user = res.data;

		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}

		if (user.avatar && !user.isGoogleAccount) {
			const avatarPath = path.join(uploadsDir, user.avatar);
			try {
				statSync(avatarPath); // throws an error if it doesn't exist
			} catch {
				user.avatar = undefined;
			}
		}

		reply.send(user);
	} catch (error: any) {
		console.error("Authentication error:", error);
		reply.status(401).send({ error: "Unauthorized" });
	}
});

fastify.post("/2fa/setup", async (req, reply) => {
	const { username } = req.body as { username: string };
	if (!username) return reply.status(400).send({ error: "Username required" });

	const secret = generateSecret();
	await axios.post(`${SQLITE_DB_URL}/set-2fa-secret`, {
		username,
		secret,
	});

	const otpauthUrl = `otpauth://totp/PongApp%20(${encodeURIComponent(username)})?secret=${secret}&issuer=PongApp`;
	const qr = await QRCode.toDataURL(otpauthUrl);

	reply.send({ qr, secret });
});

fastify.post("/2fa/verify", async (req, reply) => {
	const { username, token } = req.body as { username: string; token: string };
	if (!username || !token) return reply.status(400).send({ error: "Missing fields" });

	const res = await axios.get(
		`${SQLITE_DB_URL}/get-user-by-username/${encodeURIComponent(username)}`,
	);
	const user = res.data;
	if (!user || !user.twofa_secret) return reply.status(400).send({ error: "2FA not enabled" });

	const verified = verifyTOTP(user.twofa_secret, token);

	if (!verified) return reply.status(401).send({ error: "Invalid 2FA code" });

	const tokenPayload: TokenPayload = {
		username: user.username,
		id: user.id,
	};
	const jwt = fastify.jwt.sign(tokenPayload);

	reply.send({ token: jwt });
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

	const payload = ticket.getPayload();
	if (!payload || !payload.email) {
		return reply.status(401).send({ error: "Invalid Google user" });
	}

	const username = payload.email;
	const name = payload.name || username.split("@")[0];
	const avatar = payload.picture || "";

	// Check if user exists, else create
	let userRes = await axios.get(
		`${SQLITE_DB_URL}/get-user-by-username/${encodeURIComponent(username)}`,
	);
	let user = userRes.data;
	if (!user || user.error) {
		// Create user
		const createRes = await axios.post(`${SQLITE_DB_URL}/add-user`, {
			username,
			password: "", // No password for Google users
			name,
			avatar,
			isGoogleAccount: true,
		});
		if (!createRes.data || !createRes.data.id) {
			return reply.status(500).send({ error: "Failed to create Google user" });
		}
		user = { id: createRes.data.id, username, name, avatar };
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
