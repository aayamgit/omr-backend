import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { success: false, message: 'Password not set for this user' },
        { status: 500 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: String(user._id),
      email: user.email,
      role: user.role || 'user',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role || 'user',
      },
    });

    response.cookies.set('omr_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('LOGIN_ERROR:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error during login' },
      { status: 500 }
    );
  }
}