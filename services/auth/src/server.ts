import Fastify from "fastify";
import fastifyMultipart from "@fastify/multipart";
import fastifyCors from "@fastify/cors";
import * as bcrypt from "bcryptjs";
import { writeFile } from "fs/promises";
import * as path from "path";
import fastifyStatic from "@fastify/static";
import { fileURLToPath } from "url";
import fastifyJwt from "@fastify/jwt";
import { existsSync, mkdirSync } from "fs";
import * as dotenv from "dotenv";

// TODO(KL) integrate with sqldb service
dotenv.config();
const dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.JWT_SECRET) {
	console.error("FATAL: JWT_SECRET is not set in the environment.");
	process.exit(1);
}

const fastify = Fastify();
const users: Record<string, any> = {};

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

fastify.post("/signup", async (req, reply) => {
	const parts = req.parts();
	const data: Record<string, string> = {};
	let avatarFile: any = null;

	for await (const part of parts) {
		if (part.type === "file") {
			// Check MIME type
			if (part.mimetype !== "image/jpeg" && part.mimetype !== "image/png") {
				return reply.status(400).send({ error: "Only JPEG and PNG files are allowed." });
			}
			// Optionally, check file extension as well
			const validExtensions = [".jpg", ".jpeg", ".png"];
			const ext = (part.filename || "").toLowerCase().slice(-4);
			if (!validExtensions.some((v) => part.filename?.toLowerCase().endsWith(v))) {
				return reply.status(400).send({ error: "Invalid file extension." });
			}
			try {
				// Try to read the file buffer (this will throw if corrupted)
				await part.toBuffer();
			} catch (err) {
				return reply.status(400).send({ error: "File is corrupted or unreadable." });
			}
			avatarFile = part;
		} else {
			data[part.fieldname] = part.value?.toString() ?? "";
		}
	}

	const { name, age, username, password } = data;

	if (!name || !age || !username || !password || !avatarFile) {
		return reply.status(400).send({
			error: "Missing fields " + name + " " + age + " " + username + " " + password,
		});
	}

	if (users[username]) {
		return reply.status(409).send({ error: "User exists" });
	}
	try {
		const hash = await bcrypt.hash(password, 10);
		const avatarPath = `uploads/${username}-${avatarFile.filename}`;
		const buffer = await avatarFile.toBuffer();
		await writeFile(avatarPath, buffer);

		users[username] = { name, age, username, password: hash, avatar: avatarPath };

		reply.send({ success: true });
	} catch (error) {
		console.error("Error during signup:", error);
	}
});

fastify.post("/login", async (req, reply) => {
	const { username, password } = req.body as { username: string; password: string };
	const user = users[username];

	if (!user || !(await bcrypt.compare(password, user.password))) {
		return reply.status(401).send({ error: "Invalid credentials" });
	}

	const token = fastify.jwt.sign({ username });
	reply.send({ token });
});

fastify.get("/me", async (req, reply) => {
	try {
		const auth = req.headers.authorization?.split(" ")[1];
		const payload = await fastify.jwt.verify<{ username: string }>(auth!);

		const user = users[payload.username];
		reply.send({
			name: user.name,
			age: user.age,
			avatar: user.avatar,
		});
	} catch {
		console.error("Authentication error:");
		reply.status(401).send({ error: "Unauthorized" });
	}
});

const uploadsDir = path.join(dirname, "..", "uploads");
if (!existsSync(uploadsDir)) {
	mkdirSync(uploadsDir, { recursive: true });
}

fastify.register(fastifyStatic, {
	root: path.join(dirname, "..", "uploads"),
	prefix: "/uploads/",
});

fastify.listen({ port: 5000 }, () => {
	console.log("Auth service running at http://localhost:5000");
});
