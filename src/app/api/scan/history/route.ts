import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import ScanLog from '@/models/ScanLog';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const scans = await ScanLog.find({ userId: authUser.userId }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      scans,
    });
  } catch (error) {
    console.error('SCAN_HISTORY_ERROR', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load scan history' },
      { status: 500 }
    );
  }
}