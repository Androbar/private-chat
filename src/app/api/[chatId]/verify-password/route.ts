import Redis from "ioredis";

const redis = new Redis();

export const POST = async (request: Request, { params }: { params: { chatId: string } }) => {
  const { chatId } = params;
  const storedPassword = await redis.get(`room:${chatId}:password`);
  const { password } = await request.json()
  if (!password) {
    return Response.json({
      status: 401,
      body: {
        error: "Password is required",
      },
    });
  }
  if (!storedPassword) {
    return Response.json({
      status: 401,
      body: {
        error: "Room not found",
      },
    });
  }
  if (storedPassword!== password) {
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