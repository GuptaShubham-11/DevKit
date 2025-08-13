import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplate extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  content: string; // Main setup commands
  creatorId: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  supportedPackageManagers: string[]; // ["npm", "pnpm", "yarn", "bun"]
  tags: mongoose.Types.ObjectId[];
  downloadsCount: number;
  likesCount: number;
  viewsCount: number;
  isPremium: boolean;
  price: number;
  status: 'draft' | 'published' | 'archived';
  featuredUntil?: Date;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const templateSchema = new Schema<ITemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    downloadsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'TemplateTag',
      },
    ],
    featuredUntil: {
      type: Date,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    supportedPackageManagers: [
      {
        type: String,
        enum: ['npm', 'pnpm', 'yarn', 'bun'],
      },
    ],
  },
  { timestamps: true }
);

// Indexes for performance
templateSchema.index({ creatorId: 1 });
templateSchema.index({ categoryId: 1 });
templateSchema.index({ status: 1 });
templateSchema.index({ downloadsCount: -1 });
templateSchema.index({ featuredUntil: 1 });
templateSchema.index({ name: 'text', description: 'text' });

// Update lastUpdated on content changes
templateSchema.pre('save', function (next) {
  if (
    this.isModified('content') ||
    this.isModified('name') ||
    this.isModified('description')
  ) {
    this.lastUpdated = new Date();
  }
  next();
});

export const Template =
  mongoose.models?.Template ||
  mongoose.model<ITemplate>('Template', templateSchema);
