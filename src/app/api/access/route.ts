import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { code } = await req.json();

  if (!code || code !== process.env.ADMIN_ACCESS_CODE) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });

  res.cookies.set('admin_access', 'true', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}
