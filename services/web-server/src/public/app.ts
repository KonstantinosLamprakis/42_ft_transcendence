import { loginPage } from "./pages/login.js";
import { gamePage } from "./pages/game.js";
import { chatPage } from "./pages/chat.js";
import { profilePage } from "./pages/profile.js";
import { setToken, isLogged } from "./token.js";
import { showToast, ToastType } from "./utils/toast.js";

type RouteHandler = () => void;

const appDiv = document.getElementById("app") as HTMLElement;

const routes: Record<string, RouteHandler> = {
    "/": () => {
		cleanup();
		if (!isLogged()){
			loginPage(appDiv);
		} else {
			gamePage(appDiv);
		}
    },
    "/chat": () => {
		cleanup();
		if (!isLogged()){
			loginPage(appDiv);
		} else {
			chatPage(appDiv);
		}
    },
    "/profile": () => {
		cleanup();
		if (!isLogged()){
			loginPage(appDiv);
		} else {
			profilePage(appDiv);
		}
    },
};

function notFound(): void {
	appDiv.innerHTML = `<h1>404 - Page Not Found</h1>`;
}

function navigateTo(url: string): void {
	history.pushState(null, "", url);
	router();
}

function router(): void {
	const path = window.location.pathname;
	const route = routes[path] || notFound;
	route();
}

document.body.addEventListener("click", (e) => {
	const target = e.target as HTMLElement;
	if (target.matches("[data-link]")) {
		e.preventDefault();
		const href = (target as HTMLAnchorElement).getAttribute("href");
		if (href) navigateTo(href);
	}
});

window.addEventListener("popstate", router);

document.getElementById("logout-btn")!.addEventListener("click", async (e) => {
		localStorage.removeItem("pong-token"); // Clear token
		setToken(""); // Clear token in storage
		showToast("Logged out!", ToastType.SUCCESS);
		// Optionally clear profile and 2FA UI
		const profileDiv = document.getElementById("profile");
		if (profileDiv) profileDiv.innerHTML = "";
		const qrDiv = document.getElementById("2fa-qr");
		if (qrDiv) qrDiv.remove();
		const twofaForm = document.getElementById("twofa-form");
		if (twofaForm) twofaForm.remove();

		navigateTo("/");
	});

function cleanup() {
    if ((appDiv as any)._cleanupListeners) {
        (appDiv as any)._cleanupListeners();
        delete (appDiv as any)._cleanupListeners;
    }
}

function updateLoginUI() {
	const token = isLogged();
	if (token) {
		console.log("User is logged in with token:", token);
	} else {
		console.log("User is not logged in.");
	}
}

window.addEventListener("DOMContentLoaded", updateLoginUI);

router();
