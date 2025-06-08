export enum MessageType {
	STATUS = "status",
	CHAT_MESSAGE = "chatMessage",
	NAME_UPDATE = "nameUpdate",
}

export type ServerResponse = {
	type: MessageType;
	content: string;
	timestamp: number;
	name: string | undefined;
    senderId: string;
}
