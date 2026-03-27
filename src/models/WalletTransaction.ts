import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWalletTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  balanceAfter: number;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const WalletTransaction: Model<IWalletTransaction> =
  mongoose.models.WalletTransaction ||
  mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);

export default WalletTransaction;