// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { decrypt, getKey } from './utils/encryption';

export async function middleware(req: NextRequest) {
  const authCookie = req.cookies.get('auth');
  const secretKey = process.env.AUTH_PASSWORD;
  const redirectUrl = req.nextUrl.clone()
  redirectUrl.pathname = '/login'

  if (!authCookie || !secretKey) {
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const key = await getKey(secretKey);
    const decryptedPassword = await decrypt(authCookie.value, key);

    if (decryptedPassword !== secretKey) {
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. The login page.
     * 2. The login API route.
     */
    '/((?!login$|api/login|_next).*)',
  ],
};