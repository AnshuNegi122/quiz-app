import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import { getAdminFromRequest } from '@/lib/middleware/auth';
import { validateQuestion, returnValidationError } from '@/lib/middleware/validation';
import { errorHandler } from '@/lib/middleware/errorHandler';

// GET all questions
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const questions = await Question.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      questions: questions.map((q) => ({
        id: q._id.toString(),
        title: q.title,
        options: q.options,
        correctOption: q.correctOption,
        points: q.points,
        createdAt: q.createdAt,
      })),
    });
  } catch (error) {
    return errorHandler(error);
  }
}

// POST create question
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();

    // Validate input
    const validationErrors = validateQuestion(body);
    if (validationErrors.length > 0) {
      return returnValidationError(validationErrors);
    }

    const { title, options, correctOption, points } = body;

    const question = new Question({
      title,
      options,
      correctOption,
      points: points || 1,
    });

    await question.save();

    return NextResponse.json(
      {
        success: true,
        question: {
          id: question._id.toString(),
          title: question.title,
          options: question.options,
          correctOption: question.correctOption,
          points: question.points,
          createdAt: question.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}

