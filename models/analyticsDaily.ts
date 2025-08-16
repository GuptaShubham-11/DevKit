import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsDaily extends Document {
  _id: mongoose.Types.ObjectId;
  date: Date;
  templateId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  views: number;
  copies: number;
  likes: number;
  commandsGenerated: number;
  uniqueUsers: number;
  createdAt: Date;
}

const analyticsDailySchema = new Schema<IAnalyticsDaily>(
  {
    date: {
      type: Date,
      required: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    views: {
      type: Number,
      default: 0,
    },
    copies: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    commandsGenerated: {
      type: Number,
      default: 0,
    },
    uniqueUsers: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Indexes for analytics queries
analyticsDailySchema.index({ date: -1 });
analyticsDailySchema.index({ templateId: 1, date: -1 });
analyticsDailySchema.index({ userId: 1, date: -1 });
analyticsDailySchema.index(
  { date: -1, templateId: 1, userId: 1 },
  { unique: true }
);

export const AnalyticsDaily =
  mongoose.models?.AnalyticsDaily ||
  mongoose.model<IAnalyticsDaily>('AnalyticsDaily', analyticsDailySchema);
