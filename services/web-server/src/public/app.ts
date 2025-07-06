import { loginPage } from "./pages/login.js";
import { gamePage } from "./pages/game.js";
import { chatPage } from "./pages/chat.js";
import { profilePage } from "./pages/profile.js";

type RouteHandler = () => void;

const appDiv = document.getElementById("app") as HTMLElement;

const routes: Record<string, RouteHandler> = {
	"/": () => loginPage(appDiv),
	"/game": () => gamePage(appDiv),
	"/chat": () => chatPage(appDiv),
	"/profile": () => profilePage(appDiv),
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

router();
