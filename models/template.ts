import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplate extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  content: string; // Main setup commands
  creatorId: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  supportedPackageManagers: mongoose.Types.ObjectId[];
  tags: mongoose.Types.ObjectId[];
  copiesCount: number;
  likesCount: number;
  viewsCount: number;
  status: 'draft' | 'published' | 'archived';
  featuredUntil?: Date;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
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
    copiesCount: {
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
        type: Schema.Types.ObjectId,
        ref: 'PackageManager',
        required: true,
      },
    ],
  },
  { timestamps: true }
);

// Indexes for performance
templateSchema.index({ creatorId: 1 });
templateSchema.index({ categoryId: 1 });
templateSchema.index({ status: 1 });
templateSchema.index({ copiesCount: -1 });
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
