import { HTTPS_API_URL } from "./types.js";
import { getToken, setToken, isLogged } from "./token.js"

// let token = "";	

function updateLoginUI() {
  const token = isLogged();
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const welcomeMsg = document.getElementById('welcome-msg');
  const logOut = document.getElementById('logout-btn');

  if (!loginForm || !welcomeMsg || !logOut || !signupForm) return;

  if (token) {
    loginForm.style.display = 'none';
	signupForm.style.display = 'none';
    welcomeMsg.style.display = 'block';
	logOut.style.display = 'block';
} else {
	loginForm.style.display = 'block';
	signupForm.style.display = 'block';
    welcomeMsg.style.display = 'none';
	logOut.style.display = 'none';
  }
}

window.addEventListener('DOMContentLoaded', updateLoginUI);
// And after login success call updateLoginUI();


document.getElementById("signup-form")!.addEventListener("submit", async (e) => {
	e.preventDefault();
	const form = e.target as HTMLFormElement;
	const formData = new FormData(form);

	formData.forEach((value, key) => {
		console.log(`FormData: ${key} = ${value}`);
	});

	const res = await fetch(`${HTTPS_API_URL}/signup`, {
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

	const res = await fetch(`${HTTPS_API_URL}/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	const data = await res.json();

	if (!res.ok) {
		const error = await res.json();
		alert(error.error || "Something went wrong.");
		return;
	}
	// token = data.token;
	setToken(data.token);
	alert("Logged in");
	updateLoginUI();
});

(window as any).getProfile = async () => {
	const res = await fetch(`${HTTPS_API_URL}/me`, {
		headers: { Authorization: `Bearer ${ getToken() }` },
		// headers: { Authorization: `Bearer ${ token }` },
	});

	const data = await res.json();

	const profileDiv = document.getElementById("profile")!;
	profileDiv.innerHTML = `
    <p><b>Name:</b> ${data.name}</p>
    <p><b>Username:</b> ${data.username}</p>
    <p><b>Wins:</b> ${data.wins}</p>
    <p><b>Loses:</b> ${data.loses}</p>
    <img src="${data.avatar ? `${HTTPS_API_URL}/uploads/${data.avatar}` : ""}" width="100" />
  `;
};

document.getElementById('logout-btn')!.addEventListener('click', () => {
  localStorage.removeItem('token');  // Clear token
  alert('Logged out successfully!');
  updateLoginUI();
});
