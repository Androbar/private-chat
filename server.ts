import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import express from 'express';
import { Server } from "socket.io";
import Redis from 'ioredis';

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

    socket.on('createRoom', async ({ room, password }) => {
      await redis.set(`room:${room}:password`, password);
      socket.emit('roomCreated', room);
    });

    socket.on("joinRoom", async ({ room, password, user }) => {
      const storedPassword = await redis.get(`room:${room}:password`);
      if (storedPassword === password) {
        socket.join(room);
        await redis.sadd(`room:${room}:users`, user);
        socket.emit("joinedRoom", room);
        socket.to(room).emit('userJoined', user);

        const messages = await redis.lrange(`room:${room}:messages`, 0, -1);
        const loadMessages = messages.map(message => JSON.parse(message));

        socket.emit('loadMessages', loadMessages);

        const users = await redis.smembers(`room:${room}:users`);
        io.to(room).emit('updateUserList', users);
      } else {
        socket.emit("error", "Invalid password");
      }
    });

    // Listen typing events
    socket.on("startTyping", (data) => {
      io.to(data.room).emit("startTyping", data);
    });
    socket.on("stopTyping", (data) => {
      io.to(data.room).emit("stopTyping", data);
    });

    socket.on("message", async ({ room, user, message }) => {
      const messageObject = { user, message };
      await redis.rpush(`room:${room}:messages`, JSON.stringify(messageObject));
      io.to(room).emit("message", messageObject);
    });

    socket.on("disconnect", async () => {
      console.log("A user disconnected:", socket.id);
      // Remove user from all rooms they were part of
      const rooms = Array.from(socket.rooms);
      for (const room of rooms) {
        await redis.srem(`room:${room}:users`, socket.id);

        // Notify others in the room
        socket.to(room).emit('userDisconnected', socket.id);

        const users = await redis.smembers(`room:${room}:users`);
        io.to(room).emit('updateUserList', users);
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
