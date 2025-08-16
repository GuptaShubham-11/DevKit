import mongoose, { Schema, Document } from 'mongoose';

export interface IUserBadge extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  badgeId: mongoose.Types.ObjectId;
  earnedAt: Date;
  progressData: {
    currentValue: number;
    targetValue: number;
    progressPercentage: number;
    milestoneData?: any;
  };
  notificationSent: boolean;
  isFeatured: boolean;
  featuredUntil?: Date;
  sharingData: {
    sharedCount: number;
    lastShared?: Date;
  };
  __v?: number;
}

const userBadgeSchema = new Schema<IUserBadge>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    badgeId: {
      type: Schema.Types.ObjectId,
      ref: 'Badge',
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    progressData: {
      currentValue: {
        type: Number,
        default: 0,
      },
      targetValue: {
        type: Number,
        required: true,
      },
      progressPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      milestoneData: Schema.Types.Mixed,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: {
      type: Date,
    },
    sharingData: {
      sharedCount: {
        type: Number,
        default: 0,
      },
      lastShared: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate badges for same user
userBadgeSchema.index({ userId: 1, badgeId: 1 });

// Additional indexes
userBadgeSchema.index({ userId: 1, earnedAt: -1 });
userBadgeSchema.index({ badgeId: 1, earnedAt: -1 });
userBadgeSchema.index({ isFeatured: 1, featuredUntil: 1 });

// Virtual to populate badge details
userBadgeSchema.virtual('badgeDetails', {
  ref: 'Badge',
  localField: 'badgeId',
  foreignField: '_id',
  justOne: true,
});

// Method to update progress
userBadgeSchema.methods.updateProgress = function (
  currentValue: number,
  targetValue: number
) {
  this.progressData.currentValue = currentValue;
  this.progressData.targetValue = targetValue;
  this.progressData.progressPercentage = Math.min(
    Math.round((currentValue / targetValue) * 100),
    100
  );
  return this;
};

// Method to mark as earned
userBadgeSchema.methods.markAsEarned = function () {
  this.progressData.progressPercentage = 100;
  this.earnedAt = new Date();
  return this;
};

export const UserBadge =
  mongoose.models?.UserBadge ||
  mongoose.model<IUserBadge>('UserBadge', userBadgeSchema);
