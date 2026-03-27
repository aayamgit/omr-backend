import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IScanLog extends Document {
  userId: mongoose.Types.ObjectId;
  templateId?: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  totalSheets: number;
  processedSheets: number;
  status: 'UPLOADED' | 'PROCESSED' | 'FAILED';
  deductedCredits: number;
  resultSummary?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ScanLogSchema = new Schema<IScanLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
    },
    fileName: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    totalSheets: {
      type: Number,
      default: 0,
    },
    processedSheets: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['UPLOADED', 'PROCESSED', 'FAILED'],
      default: 'UPLOADED',
    },
    deductedCredits: {
      type: Number,
      default: 0,
    },
    resultSummary: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const ScanLog: Model<IScanLog> =
  mongoose.models.ScanLog || mongoose.model<IScanLog>('ScanLog', ScanLogSchema);

export default ScanLog;