import { HTTPS_API_URL, meResponse } from "./types.js";

let token: string = localStorage.getItem("pong-token") || "";
let user: meResponse | undefined;

export const setToken = async (newToken: string) => {
	if (!newToken) {
		clearToken();
		return;
	}
	if (!user){
		await fetchUser();
	}
	token = newToken;
	localStorage.setItem("pong-token", newToken);
}

export function clearToken() {
	token = "";
	user = undefined;
	localStorage.removeItem("pong-token");
}

export function getToken(): string {
	return token;
}

export async function isLogged(): Promise<boolean> {
	if (!!token && !user){
		await fetchUser();
	}
	return !!token && user !== undefined;
}

export const fetchUser = async (): Promise<meResponse | undefined> => {
	if (!token) return undefined;
	if (user) return user;

	try {
		const res = await fetch(`${HTTPS_API_URL}/me`, {
			headers: { Authorization: `Bearer ${getToken()}` },
		});

		if (!res.ok) {
			user = undefined;
			return undefined;
		}

		const data = await res.json();

		if (data.error) {
			user = undefined;
			return undefined;
		}

		user = data;
		return user;
	} catch (err) {
		console.error("Error fetching user:", err);
		user = undefined;
		return undefined;
	}
};
