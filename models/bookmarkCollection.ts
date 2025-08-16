import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmarkCollection extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  userId: mongoose.Types.ObjectId;
  color?: string; // hex color
  icon?: string; // icon name
  isDefault: boolean; // default collection for user
  isPrivate: boolean;
  bookmarkCount: number; // cached count
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkCollectionSchema = new Schema<IBookmarkCollection>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      unique: true,
    },
    description: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    color: {
      type: String,
      match: /^#([0-9A-F]{3}){1,2}$/i, // hex color
    },
    icon: {
      type: String,
      maxlength: 10,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
    bookmarkCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: [
      {
        type: String,
        maxlength: 50,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
bookmarkCollectionSchema.index({ userId: 1, name: 1 });
bookmarkCollectionSchema.index({ userId: 1, isDefault: 1 });

export const BookmarkCollection =
  mongoose.models?.BookmarkCollection ||
  mongoose.model<IBookmarkCollection>(
    'BookmarkCollection',
    bookmarkCollectionSchema
  );
