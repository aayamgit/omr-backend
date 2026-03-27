import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    const order = await razorpay.orders.create({
      amount: amount * 100, // paisa
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}