import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

type TokenPayload = {
  userId: string;
  email: string;
  role: string;
};

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://omr.aayamcareerinstitute.co.in',
];

function applyCors(req: NextRequest, response: NextResponse) {
  const origin = req.headers.get('origin');

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
  }

  return response;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicRoutes = [
    '/login',
    '/api/auth/login',
    '/api/auth/register',
  ];

  if (req.method === 'OPTIONS') {
    return applyCors(req, new NextResponse(null, { status: 204 }));
  }

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublic) {
    return applyCors(req, NextResponse.next());
  }

  const token = req.cookies.get('omr_token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return applyCors(
        req,
        NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
        )
      );
    }

    return applyCors(req, NextResponse.redirect(new URL('/login', req.url)));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    if (pathname.startsWith('/admin') && decoded.role !== 'admin') {
      return applyCors(
        req,
        NextResponse.redirect(new URL('/dashboard', req.url))
      );
    }

    return applyCors(req, NextResponse.next());
  } catch {
    if (pathname.startsWith('/api/')) {
      return applyCors(
        req,
        NextResponse.json(
          { success: false, message: 'Invalid token' },
          { status: 401 }
        )
      );
    }

    return applyCors(req, NextResponse.redirect(new URL('/login', req.url)));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/api/:path*'],
};