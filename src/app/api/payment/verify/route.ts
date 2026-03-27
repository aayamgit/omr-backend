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
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !amount
    ) {
      return NextResponse.json(
        { success: false, message: 'Missing payment details' },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Razorpay secret not configured' },
        { status: 500 }
      );
    }

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    const user = await User.findById(authUser.userId);

if (!user) {
  return NextResponse.json(
    { success: false, message: 'User not found' },
    { status: 404 }
  );
}

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid amount' },
        { status: 400 }
      );
    }

    const credits = numericAmount * 1.5;

    user.omrWallet = Number(user.omrWallet || 0) + credits;
    await user.save();

    await WalletTransaction.create({
      userId: user._id,
      type: 'credit',
      amount: numericAmount,
      reason: 'Payment recharge',
      balanceAfter: user.omrWallet,
    });

    return NextResponse.json({
      success: true,
      balance: user.omrWallet,
      creditsAdded: credits,
    });
  } catch (err) {
    console.error('Payment verify error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}