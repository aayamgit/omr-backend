import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();

    const authUser = await getAuthUser();
    if (!authUser) {
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
      user,
    });
  } catch (error) {
    console.error('ME_ERROR', error);
    return NextResponse.json(
      { success: false, message: 'Server error fetching profile' },
      { status: 500 }
    );
  }
}