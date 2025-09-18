import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login and sign-up pages and API routes
  if (pathname.startsWith('/sign-up') || pathname.startsWith('/login') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get('session_token')?.value;
  const userStore = request.cookies.get('multi_user_store')?.value;

  if (!sessionToken) {
    // If user store exists, they may have an account so redirect to login
    // Otherwise redirect to sign-up
    const redirectPath = userStore ? '/login' : '/sign-up';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
