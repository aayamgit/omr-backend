import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

type TokenPayload = {
  userId: string;
  email: string;
  role: string;
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/register'];

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('omr_token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    if (pathname.startsWith('/admin') && decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/api/:path*'],
};