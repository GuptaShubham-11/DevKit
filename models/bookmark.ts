import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  collectionId?: mongoose.Types.ObjectId;
  notes?: string;
  tags: mongoose.Types.ObjectId[];
  isPrivate: boolean;
  bookmarkType: 'template' | 'collection' | 'user';
  metadata?: {
    bookmarkedAt: Date;
    lastAccessed?: Date;
    accessCount: number;
    priority: 'low' | 'medium' | 'high';
    status: 'active' | 'archived';
  };
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
      unique: true,
    },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: 'BookmarkCollection',
      default: null,
    },
    notes: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
        maxlength: 50,
        trim: true,
      },
    ],
    isPrivate: {
      type: Boolean,
      default: true,
    },
    bookmarkType: {
      type: String,
      enum: ['template', 'collection', 'user'],
      default: 'template',
    },
    metadata: {
      bookmarkedAt: {
        type: Date,
        default: Date.now,
      },
      lastAccessed: Date,
      accessCount: {
        type: Number,
        default: 0,
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate bookmarks
bookmarkSchema.index({ userId: 1, templateId: 1 });

// Indexes for queries
bookmarkSchema.index({ userId: 1, 'metadata.status': 1, createdAt: -1 });
bookmarkSchema.index({ userId: 1, collectionId: 1 });
bookmarkSchema.index({ tags: 1 });
bookmarkSchema.index({ 'metadata.priority': 1 });

// Update last accessed when bookmark is retrieved
bookmarkSchema.methods.updateAccess = function () {
  this.metadata.lastAccessed = new Date();
  this.metadata.accessCount += 1;
  return this.save();
};

export const Bookmark =
  mongoose.models?.Bookmark ||
  mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
