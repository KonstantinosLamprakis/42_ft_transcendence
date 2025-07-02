let token: string = localStorage.getItem("token") || "";

export function setToken(newToken: string) {
	token = newToken;
	localStorage.setItem("token", newToken);
}

export function getToken(): string {
	return token;
}
export function isLogged(): boolean {
	return !!token;
}