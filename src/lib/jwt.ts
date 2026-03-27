import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Please define JWT_SECRET in .env.local');
}

export type JwtPayloadType = {
  userId: string;
  email: string;
  role: string;
};

export function signToken(payload: JwtPayloadType): string {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): JwtPayloadType | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as JwtPayloadType;
  } catch {
    return null;
  }
}