import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const { userId, amount } = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    const credits = amount * 1.5; // or custom
user.omrWallet += credits;
    await user.save();

    await WalletTransaction.create({
      userId: user._id,
      type: 'credit',
      amount,
      reason: 'Admin recharge',
      balanceAfter: user.omrWallet,
    });

    return NextResponse.json({
      success: true,
      balance: user.omrWallet,
    });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}