import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import express from 'express';
import { Server } from "socket.io";
import Redis from 'ioredis';
import { EVENTS } from './src/constants';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;
const redis = new Redis();

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on(EVENTS.CREATE_ROOM, async ({ room, password }) => {
      await redis.set(`room:${room}:password`, password);
      socket.emit(EVENTS.ROOM_CREATED, room);
    });

    socket.on(EVENTS.JOIN_ROOM, async ({ room, password, user }) => {
      const storedPassword = await redis.get(`room:${room}:password`);
      if (storedPassword === password) {
        socket.join(room);
        await redis.sadd(`room:${room}:users`, user);
        socket.emit(EVENTS.JOINED_ROOM, room);
        socket.to(room).emit(EVENTS.USER_JOINED, user);

        const messages = await redis.lrange(`room:${room}:messages`, 0, -1);
        const loadMessages = messages.map(message => JSON.parse(message));

        socket.emit(EVENTS.LOAD_MESSAGES, loadMessages);

        const users = await redis.smembers(`room:${room}:users`);
        io.to(room).emit(EVENTS.UPDATE_USER_LIST, users);
      } else {
        socket.emit(EVENTS.ERROR, "Invalid password");
      }
    });

    // Listen typing events
    socket.on(EVENTS.START_TYPING, (data) => {
      io.to(data.room).emit(EVENTS.START_TYPING, data);
    });
    socket.on(EVENTS.STOP_TYPING, (data) => {
      io.to(data.room).emit(EVENTS.STOP_TYPING, data);
    });

    socket.on(EVENTS.MESSAGE, async ({ room, user, message }) => {
      const messageObject = { user, message };
      await redis.rpush(`room:${room}:messages`, JSON.stringify(messageObject));
      io.to(room).emit(EVENTS.MESSAGE, messageObject);
    });

    socket.on(EVENTS.DISCONNECT, async () => {
      console.log("A user disconnected:", socket.id);
      // Remove user from all rooms they were part of
      const rooms = Array.from(socket.rooms);
      for (const room of rooms) {
        await redis.srem(`room:${room}:users`, socket.id);

        // Notify others in the room
        socket.to(room).emit(EVENTS.USER_DISCONNECTED, socket.id);

        const users = await redis.smembers(`room:${room}:users`);
        io.to(room).emit(EVENTS.UPDATE_USER_LIST, users);
      }
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
