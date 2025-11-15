import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import { errorHandler } from '@/lib/middleware/errorHandler';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const questions = await Question.find()
      .select('title options points imageUrl')
      .sort({ createdAt: -1 })
      .lean();

    // Remove correctOption from response for participants
    // Add defensive checks for missing fields
    const questionsWithoutAnswers = questions.map((q) => ({
      id: q._id?.toString() || '',
      title: q.title || '',
      options: Array.isArray(q.options) ? q.options : [],
      points: q.points || 1,
      imageUrl: q.imageUrl || null,
    })).filter((q) => q.id && q.title && q.options.length > 0); // Filter out invalid questions

    return NextResponse.json({ questions: questionsWithoutAnswers });
  } catch (error) {
    return errorHandler(error);
  }
}

