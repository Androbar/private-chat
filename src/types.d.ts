export type Message = {
  user: User;
  message: string;
};

export type User = {
  name: string;
  socketId: string | undefined;
};

export interface CreateRoomData {
  room: string;
  password: string;
}

export interface JoinRoomData {
  room: string;
  user: User;
}

export interface TypingData {
  room: string;
  user: User;
  senderId: string,
}

export interface MessageData {
  room: string;
  user: User;
  message: string;
}

export interface LoadMessagesData {
  room: string;
  messages: Array<{ user: User; message: string }>;
}

export type SocketEvents = {
  CREATE_ROOM: CreateRoomData;
  JOIN_ROOM: JoinRoomData;
  START_TYPING: TypingData;
  STOP_TYPING: TypingData;
  MESSAGE: MessageData;
  LOAD_MESSAGES: LoadMessagesData[];
  ROOM_CREATED: string;
  JOINED_ROOM: string;
  USER_JOINED: User;
  USER_DISCONNECTED: string;
  UPDATE_USER_LIST: User[];
  DISCONNECT: void;
};
