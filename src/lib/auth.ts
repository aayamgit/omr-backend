import { cookies } from 'next/headers';
import { verifyToken } from './jwt';

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('omr_token')?.value;

  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return decoded;
}