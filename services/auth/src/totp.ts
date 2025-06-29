import * as crypto from "crypto";
import base32 from "base32.js";

export function generateSecret(length = 20): string {
	const buffer = crypto.randomBytes(length);
	return base32.encode(buffer).replace(/=+$/, ""); // remove padding
}

export function generateTOTP(secret: string, window: number = 0): string {
	const key = Buffer.from(base32.decode(secret));
	const time = Math.floor(Date.now() / 1000 / 30) + window;
	const msg = Buffer.alloc(8);
	msg.writeUInt32BE(0, 0); // high bits (always zero)
	msg.writeUInt32BE(time, 4); // low bits

	const hmac = crypto.createHmac("sha1", key).update(msg).digest();
	const offset = hmac[hmac.length - 1] & 0xf;
	const code =
		((hmac[offset] & 0x7f) << 24) |
		((hmac[offset + 1] & 0xff) << 16) |
		((hmac[offset + 2] & 0xff) << 8) |
		(hmac[offset + 3] & 0xff);

	return (code % 1e6).toString().padStart(6, "0");
}

// Verify a TOTP code (accepts ±1 window for clock drift)
export function verifyTOTP(secret: string, token: string): boolean {
	for (let w = -1; w <= 1; w++) {
		if (generateTOTP(secret, w) === token) return true;
	}
	return false;
}
