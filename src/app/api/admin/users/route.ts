import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const users = await User.find().select('-password');

    return NextResponse.json({
      success: true,
      users,
    });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}