import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await User.findById(authUser.userId).select(
      'name email role plan omrWallet'
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      wallet: {
        balance: user.omrWallet,
        plan: user.plan,
      },
      user,
    });
  } catch (error) {
    console.error('WALLET_SUMMARY_ERROR', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load wallet summary' },
      { status: 500 }
    );
  }
}