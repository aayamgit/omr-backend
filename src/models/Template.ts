import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITemplateColumn {
  id?: string;
  name: string;
  columnType: 'objective' | 'text' | 'field';
  left: number;
  top: number;
  width: number;
  height: number;
  rows?: number;
  bubbleCount?: number;
  readDirection?: 'horizontal' | 'vertical';
  optionType?: 'alphabet' | 'numeric' | 'custom';
  startQuestion?: number;
  bubbleRadiusRatio?: number;
  darknessThreshold?: number;
  minGapThreshold?: number;
  customOptions?: string;
  order?: number;
}

export interface ITemplateBoundary {
  id?: string;
  name: string;
  left: number;
  top: number;
  width: number;
  height: number;
  order?: number;
  maxSizeVariance?: number;
}

export interface ITemplate extends Document {
  userId: mongoose.Types.ObjectId;
  templateName: string;
  sampleImageName?: string;
  sampleImageDataUrl?: string;
  baseWidth: number;
  baseHeight: number;
  columns: ITemplateColumn[];
  boundaries: ITemplateBoundary[];
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
      enum: ['objective', 'text', 'field'],
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
      default: 'horizontal',
    },
    optionType: {
      type: String,
      enum: ['alphabet', 'numeric', 'custom'],
      default: 'alphabet',
    },
    startQuestion: Number,
    bubbleRadiusRatio: Number,
    darknessThreshold: Number,
    minGapThreshold: Number,
    customOptions: String,
    order: Number,
  },
  { _id: false }
);

const TemplateBoundarySchema = new Schema<ITemplateBoundary>(
  {
    id: String,
    name: { type: String, required: true },
    left: Number,
    top: Number,
    width: Number,
    height: Number,
    order: Number,
    maxSizeVariance: Number,
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
    boundaries: {
      type: [TemplateBoundarySchema],
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