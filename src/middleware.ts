import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://omr.aayamcareerinstitute.co.in',
];

function applyCors(req, response) {
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

function getTokenFromRequest(req) {
  const cookieToken = req.cookies.get('omr_token')?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return null;
}

export function middleware(req) {
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

  const token = getTokenFromRequest(req);

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

  return applyCors(req, NextResponse.next());
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/api/:path*'],
};