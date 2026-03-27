import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      plan: 'free',
      omrWallet: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.plan,
          omrWallet: user.omrWallet,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('REGISTER_ERROR', error);
    return NextResponse.json(
      { success: false, message: 'Server error during registration' },
      { status: 500 }
    );
  }
}