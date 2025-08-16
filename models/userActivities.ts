import mongoose, { Schema, Document } from 'mongoose';

export interface IUserActivity extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  activityType: 'like' | 'view' | 'share' | 'comment' | 'bookmark';
  activityData?: {
    downloadType?: 'copy';
    referrer?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    browser?: string;
    os?: string;
    country?: string;
    duration?: number;
    previousPage?: string;
    exitPage?: string;
    sharedPlatform?:
      | 'twitter'
      | 'linkedin'
      | 'facebook'
      | 'discord'
      | 'slack'
      | 'email'
      | 'copy';
    commentId?: mongoose.Types.ObjectId;
    [key: string]: any;
  };
  getDeviceInfo?: () => { deviceType: string; browser: string; os: string };
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  sessionId?: string;
  createdAt: Date;
}

const userActivitySchema = new Schema<IUserActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    activityType: {
      type: String,
      required: true,
      enum: ['like', 'view', 'share', 'comment', 'bookmark'],
    },
    activityData: {
      downloadType: {
        type: String,
        enum: ['copy'],
      },
      referrer: {
        type: String,
        maxlength: 500,
        trim: true,
      },
      deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet'],
      },
      browser: {
        type: String,
        maxlength: 50,
        trim: true,
      },
      os: {
        type: String,
        maxlength: 50,
        trim: true,
      },
      country: {
        type: String,
        maxlength: 3, // ISO country code
        uppercase: true,
      },
      duration: {
        type: Number,
        min: 0,
        max: 3600, // Max 1 hour duration
      },
      previousPage: {
        type: String,
        maxlength: 500,
        trim: true,
      },
      exitPage: {
        type: String,
        maxlength: 500,
        trim: true,
      },
      sharedPlatform: {
        type: String,
        enum: [
          'twitter',
          'linkedin',
          'facebook',
          'discord',
          'slack',
          'email',
          'copy',
        ],
      },
      commentId: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    },
    ipAddress: {
      type: String,
      maxlength: 45,
      trim: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true;
          // Basic IP validation (IPv4 and IPv6)
          const ipv4Regex =
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|\?[0-9][0-9]?)$/;
          const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
          return ipv4Regex.test(v) || ipv6Regex.test(v);
        },
        message: 'Invalid IP address format',
      },
    },
    userAgent: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    referrer: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    sessionId: {
      type: String,
      maxlength: 128,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Enhanced indexes for better performance
userActivitySchema.index({ userId: 1, createdAt: -1 });
userActivitySchema.index({ templateId: 1, createdAt: -1 });
userActivitySchema.index({ activityType: 1, createdAt: -1 });
userActivitySchema.index({ sessionId: 1 });
userActivitySchema.index({ createdAt: -1 });
userActivitySchema.index({ userId: 1, activityType: 1, createdAt: -1 });
userActivitySchema.index({ templateId: 1, activityType: 1, createdAt: -1 });

// TTL index for data retention (optional - remove activities older than 2 years)
userActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

// Static methods with improved error handling
userActivitySchema.statics.getRecentActivity = function (
  userId: string,
  limit = 20
) {
  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new Error('Valid userId is required');
  }

  return this.find({ userId })
    .populate('templateId', 'name description creatorId status')
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 100))
    .lean();
};

userActivitySchema.statics.getTemplateActivity = function (
  templateId: string,
  activityType?: string
) {
  if (!templateId || !mongoose.isValidObjectId(templateId)) {
    throw new Error('Valid templateId is required');
  }

  const query: any = { templateId };
  if (activityType) {
    query.activityType = activityType;
  }

  return this.find(query)
    .populate('userId', 'username profileImage')
    .sort({ createdAt: -1 })
    .limit(100) // Reasonable limit
    .lean();
};

userActivitySchema.statics.getActivityStats = function (
  templateId: string,
  days = 30
) {
  if (!templateId || !mongoose.isValidObjectId(templateId)) {
    throw new Error('Valid templateId is required');
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Math.min(days, 365)); // Cap at 1 year

  return this.aggregate([
    {
      $match: {
        templateId: new mongoose.Types.ObjectId(templateId),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$activityType',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
      },
    },
    {
      $project: {
        activityType: '$_id',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        _id: 0,
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Instance methods
userActivitySchema.methods.isAnonymous = function () {
  return !this.userId;
};

userActivitySchema.methods.getDeviceInfo = function () {
  if (!this.userAgent)
    return { deviceType: 'unknown', browser: 'unknown', os: 'unknown' };

  const ua = this.userAgent.toLowerCase();

  let deviceType = 'desktop';
  if (ua.includes('mobi')) deviceType = 'mobile';
  else if (ua.includes('tablet') || ua.includes('ipad')) deviceType = 'tablet';

  let browser = 'unknown';
  if (ua.includes('edg/')) browser = 'edge';
  else if (ua.includes('chrome/')) browser = 'chrome';
  else if (ua.includes('firefox/')) browser = 'firefox';
  else if (ua.includes('safari/') && !ua.includes('chrome/'))
    browser = 'safari';

  let os = 'unknown';
  if (ua.includes('windows nt')) os = 'windows';
  else if (ua.includes('mac os x')) os = 'macos';
  else if (ua.includes('linux')) os = 'linux';
  else if (ua.includes('android')) os = 'android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'ios';

  return { deviceType, browser, os };
};

// Enhanced pre-save middleware
userActivitySchema.pre('save', function (next) {
  // Extract device info if not already present
  if (this.userAgent && !this.activityData?.deviceType) {
    const deviceInfo = (this as any).getDeviceInfo();
    if (!this.activityData) {
      this.activityData = {};
    }
    Object.assign(this.activityData, deviceInfo);
  }

  // Sanitize referrer and previous page URLs
  if (this.activityData?.referrer) {
    this.activityData.referrer = this.activityData.referrer.replace(
      /[<>]/g,
      ''
    );
  }
  if (this.activityData?.previousPage) {
    this.activityData.previousPage = this.activityData.previousPage.replace(
      /[<>]/g,
      ''
    );
  }

  next();
});

export const UserActivity =
  mongoose.models?.UserActivity ||
  mongoose.model<IUserActivity>('UserActivity', userActivitySchema);
