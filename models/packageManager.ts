import mongoose, { Schema, Document } from 'mongoose';

export interface IPackageManager extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  displayName: string;
  description: string;
  installCmd: string;
  addPackageCmd: string;
  devCmd?: string;
  buildCmd?: string;
  icon: string;
  documentationUrl?: string;
  homepageUrl?: string;
  isActive: boolean;
  usageCount: number;
  popularityScore: number;
  supportedPlatforms: string[];
  features: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const packageManagerSchema = new Schema<IPackageManager>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 50,
    },
    displayName: {
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
    installCmd: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    addPackageCmd: {
      type: String,
      required: true,
      maxlength: 100,
    },
    devCmd: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    buildCmd: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    icon: {
      type: String,
      required: true,
      trim: true,
    },
    documentationUrl: {
      type: String,
      trim: true,
      match: /^https?:\/\/.+/,
    },
    homepageUrl: {
      type: String,
      trim: true,
      match: /^https?:\/\/.+/,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    popularityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    supportedPlatforms: [
      {
        type: String,
        enum: ['windows', 'macos', 'linux', 'all'],
      },
    ],
    features: [
      {
        type: String,
        maxlength: 100,
      },
    ],
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
packageManagerSchema.index({ name: 1 });
packageManagerSchema.index({ isActive: 1 });
packageManagerSchema.index({ usageCount: -1 });
packageManagerSchema.index({ popularityScore: -1 });

// Virtual for command template generation
packageManagerSchema.virtual('commandTemplate').get(function () {
  return `${this.installCmd} create devkit-template {{templateName}} {{projectName}}`;
});

// Method to increment usage
packageManagerSchema.methods.incrementUsage = function () {
  this.usageCount += 1;
  this.popularityScore = Math.min(this.popularityScore + 0.1, 100);
  return this.save();
};

// Static method to get popular package managers
packageManagerSchema.statics.getPopular = function (limit = 5) {
  return this.find({ isActive: true })
    .sort({ popularityScore: -1, usageCount: -1 })
    .limit(limit);
};

export const PackageManager =
  mongoose.models?.PackageManager ||
  mongoose.model<IPackageManager>('PackageManager', packageManagerSchema);
