let token = "";

// TODO(KL) add const from env for api rest port and name
// TODO(KL) combine chat and auth together

document.getElementById("signup-form")!.addEventListener("submit", async (e) => {
	e.preventDefault();
	const form = e.target as HTMLFormElement;
	const formData = new FormData(form);

	formData.forEach((value, key) => {
		console.log(`FormData: ${key} = ${value}`);
	});

	const res = await fetch("https://localhost:3000/signup", {
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

	const res = await fetch("https://localhost:3000/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	const data = await res.json();
	token = data.token;
	alert("Logged in!");
});

(window as any).getProfile = async () => {
	const res = await fetch("https://localhost:3000/me", {
		headers: { Authorization: `Bearer ${token}` },
	});

	const data = await res.json();

	const profileDiv = document.getElementById("profile")!;
	profileDiv.innerHTML = `
    <p>Name: ${data.name}</p>
    <p>Age: ${data.age}</p>
    <img src="https://localhost:3000/avatar/${data.avatar}" width="100" />
  `;
};
