import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import ScanLog from '@/models/ScanLog';

const scanLogSchema = z.object({
  templateId: z.string().optional(),
  batchName: z.string().optional(),
  totalFiles: z.number().int().nonnegative(),
  successfulFiles: z.number().int().nonnegative(),
  failedFiles: z.number().int().nonnegative(),
  deductedCredits: z.number().int().nonnegative(),
  fileNames: z.array(z.string()).optional(),
  resultSummary: z.any().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = scanLogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request', errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const scanLog = await ScanLog.create({
      userId: authUser.userId,
      templateId: data.templateId || undefined,
      fileName: data.batchName || 'OMR Batch',
      fileUrl: '',
      totalSheets: data.totalFiles,
      processedSheets: data.successfulFiles,
      status: data.failedFiles > 0 ? 'PROCESSED' : 'PROCESSED',
      deductedCredits: data.deductedCredits,
      resultSummary: {
        failedFiles: data.failedFiles,
        fileNames: data.fileNames || [],
        summary: data.resultSummary || {},
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Scan summary saved successfully',
      scanLog,
    });
  } catch (error) {
    console.error('SCAN_LOG_ERROR', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save scan log' },
      { status: 500 }
    );
  }
}