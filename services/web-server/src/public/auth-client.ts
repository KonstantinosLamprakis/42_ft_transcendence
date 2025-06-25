import { CN_HTTPS_SERVER_URL } from "./types.js";

let token = "";

document.getElementById("signup-form")!.addEventListener("submit", async (e) => {
	e.preventDefault();
	const form = e.target as HTMLFormElement;
	const formData = new FormData(form);

	formData.forEach((value, key) => {
		console.log(`FormData: ${key} = ${value}`);
	});

	const res = await fetch(`${CN_HTTPS_SERVER_URL}/signup`, {
		method: "POST",
		body: formData,
	});

	const data = await res.json();
	alert(JSON.stringify(data));
});

document.getElementById("login-form")!.addEventListener("submit", async (e) => {
	e.preventDefault();
	const form = e.target as HTMLFormElement;
	const body = {
		username: (form.username as HTMLInputElement).value,
		password: (form.password as HTMLInputElement).value,
	};

	const res = await fetch(`${CN_HTTPS_SERVER_URL}/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	const data = await res.json();
	token = data.token;
	alert("Logged in!");
});

(window as any).getProfile = async () => {
	const res = await fetch(`${CN_HTTPS_SERVER_URL}/me`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	const data = await res.json();

	const profileDiv = document.getElementById("profile")!;
	profileDiv.innerHTML = `
    <p><b>Name:</b> ${data.name}</p>
    <p><b>Username:</b> ${data.username}</p>
    <p><b>Wins:</b> ${data.wins}</p>
    <p><b>Loses:</b> ${data.loses}</p>
    <img src="${data.avatar ? `${CN_HTTPS_SERVER_URL}/uploads/${data.avatar}` : ""}" width="100" />
  `;
};
