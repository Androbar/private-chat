export type Message = {
  user: User;
  message: string;
};

export type User = {
  name: string;
  socketId: string | undefined;
};