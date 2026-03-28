import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import Template from '@/models/Template';

const columnSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  columnType: z.enum(['objective', 'text']).default('objective'),
  left: z.number(),
  top: z.number(),
  width: z.number(),
  height: z.number(),
  rows: z.number().optional(),
  bubbleCount: z.number().optional(),
  readDirection: z.enum(['horizontal', 'vertical']).optional(),
  optionType: z.enum(['alphabet', 'numeric']).optional(),
  startQuestion: z.number().optional(),
  bubbleRadiusRatio: z.number().optional(),
  darknessThreshold: z.number().optional(),
  minGapThreshold: z.number().optional(),
});

const templateSchema = z.object({
  templateId: z.string().optional(),
  templateName: z.string().min(2, 'Template name is required'),
  sampleImageName: z.string().optional().default(''),
  sampleImageDataUrl: z.string().optional().default(''),
  baseWidth: z.number().positive(),
  baseHeight: z.number().positive(),
  columns: z.array(columnSchema).default([]),
  isPublic: z.boolean().optional().default(false),
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
    const parsed = templateSchema.safeParse(body);

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

    const data = parsed.data;

    let savedTemplate;

    if (data.templateId && mongoose.Types.ObjectId.isValid(data.templateId)) {
      savedTemplate = await Template.findOneAndUpdate(
        {
          _id: data.templateId,
          userId: authUser.userId,
        },
        {
          templateName: data.templateName,
          sampleImageName: data.sampleImageName,
          sampleImageDataUrl: data.sampleImageDataUrl,
          baseWidth: data.baseWidth,
          baseHeight: data.baseHeight,
          columns: data.columns,
          isPublic: data.isPublic,
        },
        { new: true }
      );
    }

    if (!savedTemplate) {
      savedTemplate = await Template.create({
        userId: authUser.userId,
        templateName: data.templateName,
        sampleImageName: data.sampleImageName,
        sampleImageDataUrl: data.sampleImageDataUrl,
        baseWidth: data.baseWidth,
        baseHeight: data.baseHeight,
        columns: data.columns,
        isPublic: data.isPublic,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Template saved successfully',
      template: savedTemplate,
    });
  } catch (error) {
    console.error('SAVE_TEMPLATE_ERROR', error);
    return NextResponse.json(
      { success: false, message: 'Server error while saving template' },
      { status: 500 }
    );
  }
}