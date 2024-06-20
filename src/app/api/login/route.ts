import { encrypt, getKey } from '@/utils/encryption';
import { cookies } from 'next/headers'

export const POST = async (request: Request) => {
  const { password } = await request.json()
  const appPassword = process.env.AUTH_PASSWORD;
  if (!password) {
    return Response.json({
      status: 401,
      body: {
        error: "Password is required",
      },
    });
  }

  if (appPassword!== password) {
    return Response.json({
      status: 401,
      body: {
        error: "Incorrect password",
      },
    });
  }
  const key = await getKey(appPassword!);
  const encryptedPassword = await encrypt(password, key);
  cookies().set('auth', encryptedPassword)
  return Response.json({
    status: 200,
    body: {
      access: 'granted',
    },
  });
};

