import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITemplateColumn {
  id?: string;
  name: string;
  columnType: 'objective' | 'text';
  left: number;
  top: number;
  width: number;
  height: number;
  rows?: number;
  bubbleCount?: number;
  readDirection?: 'horizontal' | 'vertical';
  optionType?: 'alphabet' | 'numeric';
  startQuestion?: number;
  bubbleRadiusRatio?: number;
  darknessThreshold?: number;
  minGapThreshold?: number;
}

export interface ITemplate extends Document {
  userId: mongoose.Types.ObjectId;
  templateName: string;
  sampleImageName?: string;
  sampleImageDataUrl?: string;
  baseWidth: number;
  baseHeight: number;
  columns: ITemplateColumn[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateColumnSchema = new Schema<ITemplateColumn>(
  {
    id: String,
    name: { type: String, required: true },
    columnType: {
      type: String,
      enum: ['objective', 'text'],
      default: 'objective',
    },
    left: Number,
    top: Number,
    width: Number,
    height: Number,
    rows: Number,
    bubbleCount: Number,
    readDirection: {
      type: String,
      enum: ['horizontal', 'vertical'],
    },
    optionType: {
      type: String,
      enum: ['alphabet', 'numeric'],
    },
    startQuestion: Number,
    bubbleRadiusRatio: Number,
    darknessThreshold: Number,
    minGapThreshold: Number,
  },
  { _id: false }
);

const TemplateSchema = new Schema<ITemplate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    templateName: {
      type: String,
      required: true,
      trim: true,
    },
    sampleImageName: {
      type: String,
      default: '',
    },
    sampleImageDataUrl: {
      type: String,
      default: '',
    },
    baseWidth: {
      type: Number,
      required: true,
    },
    baseHeight: {
      type: Number,
      required: true,
    },
    columns: {
      type: [TemplateColumnSchema],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Template: Model<ITemplate> =
  mongoose.models.Template ||
  mongoose.model<ITemplate>('Template', TemplateSchema);

export default Template;