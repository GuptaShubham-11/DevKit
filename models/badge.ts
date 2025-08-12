import mongoose, { Schema, Document } from 'mongoose';

export interface IBadge extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  badgeImage: string;
  criteria: {
    type: string;
    condition: string;
    value: number;
    timeframe?: string;
    additionalConditions?: any;
  };
  pointsRequired: number;
  rarityLevel: 'common' | 'rare' | 'epic' | 'legendary';
  rewardData: {
    xpBonus?: number;
    profileBadge?: boolean;
    specialPrivileges?: string[];
  };
  isActive: boolean;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

const badgeSchema = new Schema<IBadge>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    badgeImage: {
      type: String,
      required: true,
    },
    criteria: {
      type: {
        type: String,
        required: true,
        enum: [
          'templatesCreated',
          'downloadsReceived',
          'commandsGenerated',
          'likesReceived',
          'reviewsWritten',
          'communityHelper',
        ],
      },
      condition: {
        type: String,
        required: true,
        enum: ['gte', 'lte', 'eq', 'between'],
      },
      value: {
        type: Number,
        required: true,
      },
      timeframe: {
        type: String,
        enum: ['allTime', '30Days', '7Days', '1Day'],
        default: 'allTime',
      },
      additionalConditions: Schema.Types.Mixed,
    },
    pointsRequired: {
      type: Number,
      default: 0,
      min: 0,
    },
    rarityLevel: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common',
    },
    rewardData: {
      xpBonus: {
        type: Number,
        default: 0,
      },
      profileBadge: {
        type: Boolean,
        default: true,
      },
      specialPrivileges: [String],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      default: 'general',
      enum: [
        'creator',
        'community',
        'usage',
        'milestone',
        'special',
        'seasonal',
        'achievement',
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
badgeSchema.index({ rarityLevel: 1 });
badgeSchema.index({ category: 1 });
badgeSchema.index({ isActive: 1 });
badgeSchema.index({ 'criteria.type': 1 });

export const Badge =
  mongoose.models?.Badge || mongoose.model<IBadge>('Badge', badgeSchema);
