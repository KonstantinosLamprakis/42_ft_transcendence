import { loginPage } from "./pages/login.js";
import { gamePage } from "./pages/game.js";
import { profilePage } from "./pages/profile.js";
import { isLogged, clearToken } from "./token.js";
import { showToast, ToastType } from "./utils/toast.js";
import { connectSocket, disconnectSocket } from "./utils/online-status.js";

type RouteHandler = () => void;

const appDiv = document.getElementById("app") as HTMLElement;

const routes: Record<string, RouteHandler> = {
    "/": async () => {
		cleanup();
		const isLoggedIn = await isLogged();
		if (!isLoggedIn){
			loginPage(appDiv);
		} else {
			gamePage(appDiv);
			connectSocket();
		}
    },
    "/profile": async () => {
		cleanup();
		const isLoggedIn = await isLogged();
		if (!isLoggedIn){
			loginPage(appDiv);
		} else {
			profilePage(appDiv);
			connectSocket();
		}
    },
};

window.addEventListener("storage", (event) => {
	if (event.key === "logout") {
		disconnectSocket();
		clearToken();
		showToast("Logged out!", ToastType.SUCCESS);
		navigateTo("/");
	}
    if (event.key === "login") {
        window.location.reload();
    }
});

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
		disconnectSocket();
		localStorage.setItem("logout", Date.now().toString());
		clearToken();
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

router();
