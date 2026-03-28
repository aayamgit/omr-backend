import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message: 'MongoDB connected successfully ✅',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: 'MongoDB connection failed ❌',
    });
  }
}