import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);

    if (!authUser?.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await User.findById(authUser.userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role || 'user',
      },
    });
  } catch (error: any) {
    console.error('ME_ERROR:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to load user' },
      { status: 500 }
    );
  }
}