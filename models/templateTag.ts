import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplateTag extends Document {
  _id: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  tagId: mongoose.Types.ObjectId;
  relevanceScore: number;
  createdAt: Date;
}

const templateTagSchema = new Schema<ITemplateTag>(
  {
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    tagId: {
      type: Schema.Types.ObjectId,
      ref: 'Tag',
      required: true,
    },
    relevanceScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: { createdAt: 'createdAt' } }
);

export const TemplateTag =
  mongoose.models?.TemplateTag ||
  mongoose.model<ITemplateTag>('TemplateTag', templateTagSchema);
