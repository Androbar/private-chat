import { Server as IoServer } from 'socket.io';
import { createClient } from "redis";
import { promisify } from "util";
import type { NextApiRequest, NextApiResponse } from 'next';
import { RedisClientType } from "redis";


const redis_url = process.env.REDIS_URL;

let redisClient: RedisClientType | undefined;

const initializeRedisClient = () => {
  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    redisClient.connect();
  }
};
initializeRedisClient()

// const redisClient = createClient({ url: redis_url });
const getAsync = promisify(redisClient?.get || (() => {})).bind(redisClient);
const lpushAsync = promisify(redisClient?.lPush || (() => {})).bind(
  redisClient
);
const lrangeAsync = promisify(redisClient?.lRange || (() => {})).bind(
  redisClient
);

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (!(res.socket as any).server.io) {
    console.log('*First use, starting socket.io');
    const io = new IoServer((res.socket as any).server);

    io.on("connection", (socket) => {
      console.log('----------------------------------------------')
      console.log(`${socket.id} connected`);

      socket.on("joinRoom", async ({ room, password }) => {
        const roomPassword = await getAsync(room);
        if (roomPassword === password) {
          socket.join(room);
          socket.emit("joinedRoom", room);
          // Retrieve last 50 messages from Redis for the room
          const messages = await lrangeAsync(room, -50, -1);
          socket.emit("loadMessages", messages);
        } else {
          socket.emit("error", "Invalid password");
        }
      });

      socket.on("message", async ({ room, user, message }) => {
        const messageObject = { user, message };
        console.log("messageObject:", messageObject);
        // Store message in Redis
        await lpushAsync(room, JSON.stringify(messageObject));
        console.log("room:", room);
        // Emit message to room
        io.in(room as string).emit("message", messageObject);
      });

      socket.on("disconnect", () => {
        // Handle disconnection and remove room if empty
      });
    });
    (res.socket as any).server.io = io;
  } else {
    console.log("Socket.io already initialized");
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;
