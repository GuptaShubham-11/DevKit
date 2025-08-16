import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectOption extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: mongoose.Types.ObjectId[];
  tags: mongoose.Types.ObjectId[];
  command: string;
  packageManager: mongoose.Types.ObjectId[];
  isActive: boolean;
  sortOrder: number;
  metadata?: {
    icon?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const projectOptionSchema = new Schema<IProjectOption>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    category: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
        required: true,
      },
    ],
    command: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    packageManager: [
      {
        type: Schema.Types.ObjectId,
        ref: 'PackageManager',
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    metadata: {
      icon: String,
    },
  },
  { timestamps: true }
);

// indexes
projectOptionSchema.index({
  category: 1,
  isActive: 1,
  sortOrder: 1,
});
projectOptionSchema.index({ tags: 1 });

export const ProjectOption =
  mongoose.models?.ProjectOption ||
  mongoose.model<IProjectOption>('ProjectOption', projectOptionSchema);
