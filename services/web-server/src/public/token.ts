let token: string = localStorage.getItem("pong-token") || "";

export function setToken(newToken: string) {
	token = newToken;
	localStorage.setItem("pong-token", newToken);
}

export function getToken(): string {
	return token;
}
export function isLogged(): boolean {
	return !!token;
}