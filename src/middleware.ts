import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  // Extract subdomain (handle both admin.localhost and admin.localhost:3001)
  const hostParts = hostname.split(':')[0].split('.');
  const subdomain = hostParts[0];

  console.log('Middleware - hostname:', hostname, 'subdomain:', subdomain, 'pathname:', url.pathname);

  // Admin subdomain routing
  if (subdomain === 'admin') {
    // Rewrite root to /admin/login for unauthenticated users
    if (url.pathname === '/') {
      const newUrl = url.clone();
      newUrl.pathname = '/admin/login';
      console.log('Rewriting root to:', newUrl.pathname);
      return NextResponse.rewrite(newUrl);
    }

    // Allow /admin routes to pass through normally
    if (url.pathname.startsWith('/admin')) {
      return NextResponse.next();
    }

    // If accessing non-admin path on admin subdomain, redirect to admin
    const newUrl = url.clone();
    newUrl.pathname = '/admin/login';
    return NextResponse.redirect(newUrl);
  }

  // Main app (farmer/investor) - prevent direct /admin access
  if (url.pathname.startsWith('/admin') && subdomain !== 'admin') {
    // Prevent access to admin routes from main domain
    console.log('Blocking admin access from main domain');
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
