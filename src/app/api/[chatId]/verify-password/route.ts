import Redis from "ioredis";
import { NextApiRequest } from "next";

const redis = new Redis();

export const POST = async (request: Request, { params }: { params: { chatId: string } }) => {
  const { chatId } = params;
  const storedPassword = await redis.get(`room:${chatId}:password`);
  console.log('storedPassword: ', storedPassword)
  // console.log('request.body: ', await request.json())
  const { password } = await request.json()
  console.log('request.body.password: ',password)
  if (!password) {
    console.log("password is required")
    return Response.json({
      status: 401,
      body: {
        error: "Password is required",
      },
    });
  }
  if (!storedPassword) {
    console.log("room not found")
    return Response.json({
      status: 401,
      body: {
        error: "Room not found",
      },
    });
  }
  if (storedPassword!== password) {
    console.log("incorrect password")
    return Response.json({
      status: 401,
      body: {
        error: "Incorrect password",
      },
    });
  }
  return Response.json({
    status: 200,
    body: {
      room: chatId,
    },
  });
};