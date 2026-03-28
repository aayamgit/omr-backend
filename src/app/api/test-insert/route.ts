import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await User.create({
      name: 'Test User',
      email: `test${Date.now()}@mail.com`,
      password: 'dummyhashedpassword',
      role: 'user',
      plan: 'free',
      omrWallet: 0,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Dummy user inserted',
      user,
    });
  } catch (error) {
    console.error('TEST_INSERT_ERROR', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Insert failed',
      },
      { status: 500 }
    );
  }
}