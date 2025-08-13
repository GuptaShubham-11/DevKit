import mongoose, { Schema, Document } from 'mongoose';

export interface ITag extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  category?: string;
  usageCount: number;
  trendingScore: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      maxlength: 200,
      trim: true,
    },
    color: {
      type: String,
      match: /^#([0-9A-F]{3}){1,2}$/i, // hex code
    },
    category: {
      type: String,
      enum: ['framework', 'tool', 'language', 'platform'],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    trendingScore: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
tagSchema.index({ slug: 1 });
tagSchema.index({ category: 1 });
tagSchema.index({ trendingScore: -1 });
tagSchema.index({ isFeatured: 1 });

export const Tag =
  mongoose.models?.Tag || mongoose.model<ITag>('Tag', tagSchema);
