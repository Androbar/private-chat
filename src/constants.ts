export const EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CREATE_ROOM: "createRoom",
  ROOM_CREATED: "roomCreated",
  JOIN_ROOM: "joinRoom",
  JOINED_ROOM: "joinedRoom",
  USER_JOINED: "userJoined",
  USER_DISCONNECTED: "userDisconnected",
  LOAD_MESSAGES: "loadMessages",
  MESSAGE: "message",
  START_TYPING: "startTyping",
  STOP_TYPING: "stopTyping",
  UPDATE_USER_LIST: "updateUserList",
  ERROR: "error",
} as const;

export const SECRET_KEY = process.env.SECRET_KEY || "add-a-secret-key-please";
