enum MessageType {
	STATUS = "status",
	CHAT_MESSAGE = "chatMessage",
	NAME_UPDATE = "nameUpdate",
}

type ServerResponse = {
	type: MessageType;
	content: string;
	timestamp: number;
	name: string;
	senderId: string;
};

const CN_API_REST_GATEWAY_PORT = 3000;
const CN_WEBSOCKET_SERVER_URL = `wss://localhost:${CN_API_REST_GATEWAY_PORT}`; 

// frontend/src/client.ts
const messagesDiv = document.getElementById("messages") as HTMLDivElement;
const messageInput = document.getElementById("messageInput") as HTMLInputElement;
const sendButton = document.getElementById("sendButton") as HTMLButtonElement;
const statusParagraph = document.getElementById("status") as HTMLParagraphElement;
const userNameInput = document.getElementById("userName") as HTMLInputElement;

let socket: WebSocket | null = null;
let userId: string | null = null; // This will be assigned by the server on connection
let userName: string = "Anonymous"; // Default name

// Function to append messages to the chat window
function appendMessage(
	sender: string,
	text: string,
	isSelf: boolean = false,
	timestamp: number | undefined = undefined,
): void {
	const messageElement = document.createElement("div");
	messageElement.classList.add("mb-2", "p-3", "rounded-lg", "max-w-[80%]");

	let timeString = "";
	if (timestamp) {
		const date = new Date(timestamp);
		timeString = ` <span class="text-xs text-gray-400">${date.toLocaleTimeString()}</span>`;
	}

	if (isSelf) {
		messageElement.classList.add("bg-blue-500", "text-white", "ml-auto", "text-right");
		messageElement.innerHTML = `<p>${text}</p>${timeString}`;
	} else {
		messageElement.classList.add("bg-gray-200", "text-gray-800");
		messageElement.innerHTML = `<p class="font-semibold">${sender}:</p><p>${text}</p>${timeString}`;
	}
	messagesDiv.appendChild(messageElement);
	messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to bottom
}

// Function to connect to the WebSocket server
function connectWebSocket(): void {
	// Use 'ws://' for development. For production, consider 'wss://' with HTTPS.
	socket = new WebSocket(CN_WEBSOCKET_SERVER_URL + "/chat");
	statusParagraph.textContent = "Connecting...";

	socket.onopen = (event: Event) => {
		console.log("WebSocket connected:", event);
		statusParagraph.textContent = "Connected!";
		sendButton.disabled = false;
		messageInput.disabled = false;
		// If user name is already set, send an update
		if (userNameInput.value) {
			userName = userNameInput.value;
			if (userId) {
				socket?.send(
					JSON.stringify({ type: "nameUpdate", senderId: userId, name: userName }),
				);
			}
		}
	};

	socket.onmessage = (event: MessageEvent) => {
		try {
			const data: ServerResponse = JSON.parse(event.data);
			console.log("Received:", data);

			if (data.type === MessageType.STATUS) {
				statusParagraph.textContent = data.content;
				if (data.content.includes("Your ID:")) {
					userId = data.content.split("Your ID: ")[1];
					console.log("Assigned User ID:", userId);
				}
			} else if (data.type === MessageType.CHAT_MESSAGE) {
				const senderName = data.senderId === userId ? userName : data.name;
				appendMessage(senderName, data.content, data.senderId === userId, data.timestamp);
			} else if (data.type === MessageType.NAME_UPDATE) {
				// Optionally update display names in existing messages or maintain a client-side map
				console.log(`User ${data.senderId} is now known as ${data.name}`);
				// For simplicity, we'll just log this. In a real app, you'd manage user lists.
			}
		} catch (error) {
			console.error("Failed to parse message:", event.data, error);
		}
	};

	socket.onclose = (event: CloseEvent) => {
		console.log("WebSocket disconnected:", event);
		statusParagraph.textContent = "Disconnected. Reconnecting in 3 seconds...";
		sendButton.disabled = true;
		messageInput.disabled = true;
		setTimeout(connectWebSocket, CN_API_REST_GATEWAY_PORT); // Attempt to reconnect
	};

	socket.onerror = (error: Event) => {
		console.error("WebSocket error:", error);
		statusParagraph.textContent = "WebSocket error. Check console.";
	};
}

// Send message function
sendButton.addEventListener("click", () => {
	const message = messageInput.value.trim();
	if (message && socket && userId) {
		const chatMessage = {
			type: "chatMessage",
			senderId: userId, // Use the server-assigned ID
			text: message,
			timestamp: Date.now(),
		};
		socket.send(JSON.stringify(chatMessage));
		messageInput.value = "";
	}
});

// Allow sending message with Enter key
messageInput.addEventListener("keypress", (event: KeyboardEvent) => {
	if (event.key === "Enter") {
		sendButton.click();
	}
});

// Update user name and send to server
userNameInput.addEventListener("change", () => {
	const newName = userNameInput.value.trim();
	if (newName && newName !== userName) {
		userName = newName;
		if (socket && userId) {
			socket.send(JSON.stringify({ type: "nameUpdate", senderId: userId, name: userName }));
		}
	} else if (!newName && userName !== "Anonymous") {
		userName = "Anonymous"; // Revert to default if cleared
		if (socket && userId) {
			socket.send(JSON.stringify({ type: "nameUpdate", senderId: userId, name: userName }));
		}
	}
});

// Initial connection
connectWebSocket();
