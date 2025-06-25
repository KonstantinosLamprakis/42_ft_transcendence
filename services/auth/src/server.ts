import Fastify from "fastify";
import fastifyMultipart from "@fastify/multipart";
import fastifyCors from "@fastify/cors";
import * as bcrypt from "bcryptjs";
import { writeFile } from "fs/promises";
import * as path from "path";
import fastifyStatic from "@fastify/static";
import { fileURLToPath } from "url";
import fastifyJwt from "@fastify/jwt";
import { existsSync, mkdirSync, statSync } from "fs";
import * as dotenv from "dotenv";
import axios from "axios";

enum Runtime {
	LOCAL = "local",
	DOCKER = "docker",
}

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

fastify.register(fastifyCors, { origin: "*" });
fastify.register(fastifyMultipart);

// SQLite DB service URL (adjust if needed)
const CN_SQLITE_DB_URL =
	process.env.RUNTIME === Runtime.LOCAL ? "http://localhost:4000" : "http://sqlite-db:4000";

// Signup: create user in sqlite-db and store avatar
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

		const avatarPath = process.env.RUNTIME === Runtime.LOCAL ? `uploads/${avatarName}` : `/data/uploads/${avatarName}`;
		const buffer = await avatarFile.toBuffer();
		await writeFile(avatarPath, buffer);

		// Call sqlite-db to create user
		const res = await axios.post(`${CN_SQLITE_DB_URL}/add-user`, {
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

// Login: fetch user from sqlite-db and verify password
fastify.post("/login", async (req, reply) => {
	const { username, password } = req.body as { username: string; password: string };

	try {
		const res = await axios.get(
			`${CN_SQLITE_DB_URL}/get-user-by-username/${encodeURIComponent(username)}`,
		);
		const user = res.data;

		if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
			return reply.status(401).send({ error: "Invalid credentials" });
		}

		const token = fastify.jwt.sign({ username: user.username, id: user.id });
		reply.send({ token });
	} catch (error: any) {
		if (error.response && error.response.data) {
			return reply.status(400).send(error.response.data);
		}
		console.error("Error during login:", error);
		reply.status(500).send({ error: "Internal server error" });
	}
});

// Get current user info (all fields)
fastify.get("/me", async (req, reply) => {
	try {
		const auth = req.headers.authorization?.split(" ")[1];
		const payload = await fastify.jwt.verify<{ username: string }>(auth!);

		const res = await axios.get(
			`${CN_SQLITE_DB_URL}/get-user-by-username/${encodeURIComponent(payload.username)}`,
		);
		const user = res.data;

		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}

		// Check if avatar file exists, else set avatar to undefined
        if (user.avatar) {
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

const uploadsDir = process.env.RUNTIME === Runtime.LOCAL ? path.join(dirname, "..", "uploads") : "/data/uploads";
if (!existsSync(uploadsDir)) {
	mkdirSync(uploadsDir, { recursive: true });
}

// TODO(KL) store uploads at data to make the persistent
fastify.register(fastifyStatic, {
	root: uploadsDir,
	prefix: "/uploads/",
});

fastify.listen({ port: 5000, host: "0.0.0.0" }, () => {
	console.log("Auth service running at http://localhost:5000");
});
