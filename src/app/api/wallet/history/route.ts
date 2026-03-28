import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import WalletTransaction from '@/models/WalletTransaction';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const history = await WalletTransaction.find({
      userId: authUser.userId,
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      history,
    });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}