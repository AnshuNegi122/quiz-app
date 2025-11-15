import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  title: string;
  options: string[]; // must be length 4
  correctOption: number; // index 0-3
  points: number;
  imageUrl?: string | null;
  createdAt: Date;
}

const QuestionSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length === 4,
        message: 'Options must contain exactly 4 items',
      },
    },
    correctOption: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    points: {
      type: Number,
      default: 1,
      min: 1,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

