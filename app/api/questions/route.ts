import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import { errorHandler } from '@/lib/middleware/errorHandler';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const questions = await Question.find()
      .select('title options points')
      .sort({ createdAt: -1 })
      .lean();

    // Remove correctOption from response for participants
    const questionsWithoutAnswers = questions.map((q) => ({
      id: q._id.toString(),
      title: q.title,
      options: q.options,
      points: q.points,
    }));

    return NextResponse.json({ questions: questionsWithoutAnswers });
  } catch (error) {
    return errorHandler(error);
  }
}

