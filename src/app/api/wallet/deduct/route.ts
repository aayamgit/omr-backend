import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';

const deductSchema = z.object({
  amount: z.number().int().positive(),
  reason: z.string().optional(),
  meta: z
    .object({
      templateId: z.string().optional(),
      batchName: z.string().optional(),
      totalFiles: z.number().optional(),
      successfulFiles: z.number().optional(),
      failedFiles: z.number().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = deductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request', errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { amount, reason, meta } = parsed.data;

   const user = await User.findById(authUser.userId);

if (!user) {
  return NextResponse.json(
    { success: false, message: 'User not found' },
    { status: 404 }
  );
}

    if (user.omrWallet < amount) {
      return NextResponse.json(
        {
          success: false,
          message: 'Insufficient balance',
          balance: user.omrWallet,
        },
        { status: 400 }
      );
    }

    user.omrWallet -= amount;
    await user.save();

    await WalletTransaction.create({
      userId: user._id,
      type: 'debit',
      amount,
      reason: reason || 'OMR scan deduction',
      balanceAfter: user.omrWallet,
      meta: meta || {},
    });

    return NextResponse.json({
      success: true,
      message: 'Credits deducted successfully',
      balance: user.omrWallet,
    });
  } catch (error) {
    console.error('WALLET_DEDUCT_ERROR', error);
    return NextResponse.json(
      { success: false, message: 'Failed to deduct credits' },
      { status: 500 }
    );
  }
}