import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import ScanLog from '@/models/ScanLog';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { templateId, fileName, totalSheets } = await req.json();

    await ScanLog.create({
      userId: authUser.userId,
      templateId,
      fileName,
      totalSheets,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}