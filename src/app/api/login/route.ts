import { encrypt, getKey } from '@/utils/encryption';
import { verifyRecaptcha } from '@/utils/verifyRecaptcha';
import { cookies } from 'next/headers'

export const POST = async (request: Request) => {
  const { password, token } = await request.json()
  const appPassword = process.env.AUTH_PASSWORD;

  const isHuman = await verifyRecaptcha(token);
  if (!isHuman) {
    return Response.json({
      status: 400,
      body: {
        error: "reCAPTCHA verification failed",
      },
    });
  }

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

