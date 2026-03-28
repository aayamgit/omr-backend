import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import Template from '@/models/Template';

export async function GET() {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const templates = await Template.find({
      userId: authUser.userId,
    }).sort({ updatedAt: -1 });

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error('LIST_TEMPLATE_ERROR', error);
    return NextResponse.json(
      { success: false, message: 'Server error while fetching templates' },
      { status: 500 }
    );
  }
}