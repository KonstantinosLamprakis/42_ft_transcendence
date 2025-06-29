import { HTTPS_API_URL } from "./types.js";

let token = "";

function show2FAForm(username: string) {
    const authDiv = document.getElementById("auth")!;
    let twofaForm = document.getElementById("twofa-form");
    if (!twofaForm) {
        twofaForm = document.createElement("form");
        twofaForm.id = "twofa-form";
        twofaForm.className = "space-y-3 mt-4";
        twofaForm.innerHTML = `
            <input name="username" type="hidden" value="${username}" />
            <input name="token" placeholder="2FA Code" required class="input" />
            <button type="submit" class="btn-primary">Verify 2FA</button>
        `;
        authDiv.appendChild(twofaForm);
    }
    twofaForm.classList.remove("hidden");
    twofaForm.onsubmit = async (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const username = (form.username as HTMLInputElement).value;
        const tokenVal = (form.token as HTMLInputElement).value;
        const res = await fetch(`${HTTPS_API_URL}/2fa/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, token: tokenVal }),
        });
        const data = await res.json();
        if (data.token) {
            token = data.token;
            alert("2FA verified! Logged in.");
            form.remove();
        } else {
            alert(data.error || "2FA verification failed");
        }
    };
}

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
    if (data.require2fa) {
        alert("2FA required. Please enter your code.");
        show2FAForm(body.username);
    } else if (data.token) {
        token = data.token;
        alert("Logged in!");
    } else {
        alert(data.error || "Login failed");
    }
});

// 2FA setup (enable) for current user
(window as any).setup2FA = async (username: string) => {
    if (!username) return;
    const res = await fetch(`${HTTPS_API_URL}/2fa/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (data.qr) {
        const qrDiv = document.getElementById("2fa-qr") || document.createElement("div");
        qrDiv.id = "2fa-qr";
        qrDiv.innerHTML = `
            <p class="mt-4">Scan this QR code with your authenticator app:</p>
            <img src="${data.qr}" alt="2FA QR Code" class="mt-2 mb-2" />
            <p class="text-xs break-all">Or enter this secret manually: <b>${data.secret}</b></p>
        `;
        document.getElementById("auth")!.appendChild(qrDiv);
    } else {
        alert(data.error || "Failed to setup 2FA");
    }
};

(window as any).getProfile = async () => {
    const res = await fetch(`${HTTPS_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    const profileDiv = document.getElementById("profile")!;
    profileDiv.innerHTML = `
    <p><b>Name:</b> ${data.name}</p>
    <p><b>Username:</b> ${data.username}</p>
    <p><b>Wins:</b> ${data.wins}</p>
    <p><b>Loses:</b> ${data.loses}</p>
    <img src="${data.avatar ? `${HTTPS_API_URL}/uploads/${data.avatar}` : ""}" width="100" />
    <button onclick="setup2FA('${data.username}')" class="btn-secondary mt-2">Enable 2FA</button>
  `;
};

(window as any).logout = () => {
    token = "";
    alert("Logged out!");
    // Optionally clear profile and 2FA UI
    const profileDiv = document.getElementById("profile");
    if (profileDiv) profileDiv.innerHTML = "";
    const qrDiv = document.getElementById("2fa-qr");
    if (qrDiv) qrDiv.remove();
    const twofaForm = document.getElementById("twofa-form");
    if (twofaForm) twofaForm.remove();
};