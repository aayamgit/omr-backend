import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = body;

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment' },
        { status: 400 }
      );
    }

    const user = await User.findById(authUser.userId);

    // 💰 Add credits (1₹ = 1 scan example)
    const credits = amount * 1.5; // or custom
user.omrWallet += credits;
    await user.save();

    await WalletTransaction.create({
      userId: user._id,
      type: 'credit',
      amount,
      reason: 'Payment recharge',
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