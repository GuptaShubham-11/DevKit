import mongoose, { Schema, Document } from 'mongoose';

export interface IGeneratedCommand extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  packageManagerId: mongoose.Types.ObjectId;
  projectName: string;
  projectCategory: string;
  selectedOptions: mongoose.Types.ObjectId[];
  customOptions?: string[];
  commandText: string;
  generationTime?: number;
  ipAddress?: string;
  createdAt: Date;
}

const generatedCommandSchema = new Schema<IGeneratedCommand>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    packageManagerId: {
      type: Schema.Types.ObjectId,
      ref: 'PackageManager',
      required: true,
    },
    projectName: {
      type: String,
      required: true,
      maxlength: 100,
    },
    projectCategory: {
      type: String,
      required: true,
    },
    selectedOptions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ProjectOption',
      },
    ],
    customOptions: [String],
    commandText: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    generationTime: {
      type: Number,
      min: 0,
    },
    ipAddress: {
      type: String,
      maxlength: 45,
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

// Indexes
generatedCommandSchema.index({ userId: 1, createdAt: -1 });
generatedCommandSchema.index({ projectCategory: 1 });
generatedCommandSchema.index({ packageManagerId: 1 });

export const GeneratedCommand =
  mongoose.models?.GeneratedCommand ||
  mongoose.model<IGeneratedCommand>('GeneratedCommand', generatedCommandSchema);
