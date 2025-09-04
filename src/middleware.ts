import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login and sign-up pages and API routes
  if (pathname.startsWith('/sign-up') || pathname.startsWith('/login') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const isLoggedIn = request.cookies.get('logged_in')?.value === 'true';
  const stripeCustomerId = request.cookies.get('stripe_customer_id')?.value;

  if (!isLoggedIn) {
    const redirectPath = stripeCustomerId ? '/login' : '/sign-up';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
