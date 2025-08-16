import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  slug: string;
  parentId?: mongoose.Types.ObjectId;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  color: string;
  featuredTemplates: mongoose.Types.ObjectId[];
  clickCount: number;
  metadata: Record<string, any>;
  templateCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
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
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 100,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    icon: {
      type: String,
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
      match: /^#([0-9A-F]{3}){1,2}$/i, // hex code
    },
    featuredTemplates: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Template',
      },
    ],
    clickCount: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    templateCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ isActive: 1 });

// Pre-save middleware to generate slug if not provided
categorySchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export const Category =
  mongoose.models?.Category ||
  mongoose.model<ICategory>('Category', categorySchema);
