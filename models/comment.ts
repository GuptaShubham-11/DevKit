import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  commentText: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentchema = new Schema<IComment>(
  {
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    commentText: {
      type: String,
      maxlength: 2000,
    }
  },
  { timestamps: true }
);

// Prevent duplicate commentper user per template
commentchema.index({ templateId: 1, userId: 1 });

export const Comment =
  mongoose.models?.Comment || mongoose.model<IComment>('Comment', commentchema);
