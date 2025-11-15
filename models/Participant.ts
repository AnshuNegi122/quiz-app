import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
  questionId: mongoose.Types.ObjectId;
  answer: number;
}

export interface IParticipant extends Document {
  name: string;
  email: string;
  answers: IAnswer[];
  score: number;
  submittedAt: Date;
  attemptCount: number;
  startedAt?: Date;
  durationSeconds?: number;
}

const ParticipantSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    answers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        answer: {
          type: Number,
          required: true,
          min: 0,
          max: 3,
        },
      },
    ],
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    attemptCount: {
      type: Number,
      default: 1,
    },
    startedAt: {
      type: Date,
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Participant || mongoose.model<IParticipant>('Participant', ParticipantSchema);

