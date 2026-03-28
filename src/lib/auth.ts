import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

type JwtPayloadType = {
  userId: string;
  email?: string;
  role?: string;
};

export function verifyToken(token: string): JwtPayloadType | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayloadType;

    return decoded;
  } catch (error) {
    console.error('VERIFY_TOKEN_ERROR:', error);
    return null;
  }
}

export async function getAuthUser(req: NextRequest): Promise<JwtPayloadType | null> {
  try {
    const cookieToken = req.cookies.get('omr_token')?.value;

    const authHeader = req.headers.get('authorization');
    const bearerToken =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

    const token = bearerToken || cookieToken;

    if (!token) {
      console.log('getAuthUser: no token found');
      return null;
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      console.log('getAuthUser: invalid token');
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('GET_AUTH_USER_ERROR:', error);
    return null;
  }
}