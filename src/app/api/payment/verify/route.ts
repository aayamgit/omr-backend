import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);

    if (!authUser?.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const razorpayOrderId = String(body?.razorpay_order_id || '').trim();
    const razorpayPaymentId = String(body?.razorpay_payment_id || '').trim();
    const razorpaySignature = String(body?.razorpay_signature || '').trim();
    const numericAmount = Number(body?.amount);

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature ||
      !Number.isFinite(numericAmount)
    ) {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid payment details' },
        { status: 400 }
      );
    }

    if (numericAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid amount' },
        { status: 400 }
      );
    }

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpaySecret) {
      return NextResponse.json(
        { success: false, message: 'Razorpay secret not configured' },
        { status: 500 }
      );
    }

    const expectedSignature = createHmac('sha256', razorpaySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    const existingTransaction = await WalletTransaction.findOne({
      paymentId: razorpayPaymentId,
      type: 'credit',
    });

    if (existingTransaction) {
      return NextResponse.json(
        {
          success: false,
          message: 'Payment already processed',
        },
        { status: 409 }
      );
    }

    const user = await User.findById(authUser.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const creditsToAdd = numericAmount * 1.5;
    const currentWalletBalance = Number(user.omrWallet || 0);
    const updatedWalletBalance = currentWalletBalance + creditsToAdd;

    user.omrWallet = updatedWalletBalance;
    await user.save();

    await WalletTransaction.create({
      userId: user._id,
      type: 'credit',
      amount: numericAmount,
      reason: 'Payment recharge',
      balanceAfter: updatedWalletBalance,
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
      creditsAdded: creditsToAdd,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Payment verified and wallet recharged successfully',
        balance: updatedWalletBalance,
        creditsAdded: creditsToAdd,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment verify error:', error);

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}