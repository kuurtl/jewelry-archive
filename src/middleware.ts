import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasAccess = req.cookies.get('admin_access')?.value === 'true';

  // 1. PUBLIC BYPASS: Allow access page and its API
  if (
    pathname.startsWith('/access') ||
    pathname.startsWith('/api/access') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. CRON BYPASS: Allow the price update ONLY if it has the secret OR you are logged in
  if (pathname.startsWith('/api/admin/update-metal-prices')) {
    const authHeader = req.headers.get('authorization');
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (isCron || hasAccess) {
      return NextResponse.next();
    }
    // If not cron and not admin, block them
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. GLOBAL PROTECTION: Everything else requires the cookie
  if (!hasAccess) {
    const url = req.nextUrl.clone();
    url.pathname = '/access';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
