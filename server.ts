import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import express from 'express';
import { Server } from "socket.io";
import { EVENTS } from './src/constants';
import { SocketEvents, User } from '@/types';
import redis from './src/utils/redis';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.on(EVENTS.CREATE_ROOM, async ({ room, password }: SocketEvents["CREATE_ROOM"]) => {
      await redis.set(`room:${room}:password`, password);
      socket.emit(EVENTS.ROOM_CREATED, room);
    });

    socket.on(EVENTS.JOIN_ROOM, async ({ room, user }: SocketEvents["JOIN_ROOM"]) => {
      socket.join(room);
      console.log('user is joinging: ', user)
      await redis.sadd(`room:${room}:users`, JSON.stringify(user));
      socket.emit(EVENTS.JOINED_ROOM, room);
      socket.to(room).emit(EVENTS.USER_JOINED, user);

      const messages = await redis.lrange(`room:${room}:messages`, 0, -1);
      const loadMessages = messages.map(message => JSON.parse(message));

      socket.emit(EVENTS.LOAD_MESSAGES, loadMessages);

      const users = await redis.smembers(`room:${room}:users`);
      const parsedUsers: User[] = users.map(user => JSON.parse(user));
      io.to(room).emit(EVENTS.UPDATE_USER_LIST, parsedUsers);
    });

    // Listen typing events
    socket.on(EVENTS.START_TYPING, (data: SocketEvents["START_TYPING"]) => {
      io.to(data.room).emit(EVENTS.START_TYPING, data);
    });

    socket.on(EVENTS.STOP_TYPING, (data: SocketEvents["STOP_TYPING"]) => {
      io.to(data.room).emit(EVENTS.STOP_TYPING, data);
    });

    socket.on(EVENTS.MESSAGE, async ({ room, user, message }: SocketEvents["MESSAGE"]) => {
      const messageObject = { user, message };
      await redis.rpush(`room:${room}:messages`, JSON.stringify(messageObject));
      io.to(room).emit(EVENTS.MESSAGE, messageObject);
    }); 

    socket.on("disconnecting", async() => {
      const rooms = Array.from(socket.rooms);
      for (const room of rooms) {
        const usersJson = await redis.smembers(`room:${room}:users`);

        if (usersJson) {
          const users: User[] = usersJson.map((userJson) => JSON.parse(userJson))
          const updatedUsers = users.filter(user => user.socketId !== socket.id);
          const removedUsers = users.filter(user => user.socketId === socket.id);
          for (const user of removedUsers) {
            await redis.srem(`room:${room}:users`, JSON.stringify(user));
          }
  
          // Notify others in the room
          socket.to(room).emit(EVENTS.USER_DISCONNECTED, socket.id);
  
          // Emit the updated user list to the room
          io.to(room).emit(EVENTS.UPDATE_USER_LIST, updatedUsers);
        }
      }
    });

    socket.on(EVENTS.DISCONNECT, async () => {
      console.log("A user disconnected:", socket.id);
    });
  });

  server.all('*', (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  httpServer.listen(port, (err?: any) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
})
