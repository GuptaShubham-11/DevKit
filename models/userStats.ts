import mongoose, { Schema, Document } from 'mongoose';

export interface IUserStats extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  templatesCreated: number;
  commandsGenerated: number;
  totalViews: number;
  level: number;
  experience: number;
  achievements: Array<{
    type: string;
    earnedAt: Date;
    data: any;
  }>;
  copiesReceived: number;
  likesReceived: number;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

const userStatsSchema = new Schema<IUserStats>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    templatesCreated: {
      type: Number,
      default: 0,
      min: 0,
    },
    commandsGenerated: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalViews: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    achievements: [
      {
        type: {
          type: String,
          required: true,
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        data: Schema.Types.Mixed,
      },
    ],
    copiesReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    likesReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
userStatsSchema.index({ userId: 1 });
userStatsSchema.index({ level: -1 });
userStatsSchema.index({ experience: -1 });
userStatsSchema.index({ templatesCreated: -1 });

// Virtual for calculating next level XP requirement
userStatsSchema.virtual('nextLevelXp').get(function () {
  return this.level * 100; // Simple formula: level * 100 XP needed
});

// Method to add experience and handle level ups
userStatsSchema.methods.addExperience = function (xp: number) {
  this.experience += xp;

  const requiredXP = this.level * 100;
  if (this.experience >= requiredXP) {
    this.level += 1;
    this.experience -= requiredXP;

    // Add level up achievement
    this.achievements.push({
      type: 'levelUp',
      earnedAt: new Date(),
      data: { newLevel: this.level },
    });
  }

  return this;
};

export const UserStats =
  mongoose.models?.UserStats ||
  mongoose.model<IUserStats>('UserStats', userStatsSchema);
