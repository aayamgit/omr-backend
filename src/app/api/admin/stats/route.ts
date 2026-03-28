import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import ScanLog from '@/models/ScanLog';
import WalletTransaction from '@/models/WalletTransaction';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    const totalUsers = await User.countDocuments();
    const totalScans = await ScanLog.countDocuments();

    const revenueAgg = await WalletTransaction.aggregate([
      { $match: { type: 'credit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const latestScans = await ScanLog.find()
      .sort({ createdAt: -1 })
      .limit(7)
      .select('fileName totalSheets processedSheets deductedCredits createdAt');

    const planWiseUsers = await User.aggregate([
      {
        $group: {
          _id: '$plan',
          users: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalScans,
        revenue: revenueAgg[0]?.total || 0,
        latestScans,
        planWiseUsers,
      },
    });
  } catch (error) {
    console.error('ADMIN_STATS_ERROR', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load admin stats' },
      { status: 500 }
    );
  }
}