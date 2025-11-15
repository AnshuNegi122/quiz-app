import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import mongoose from 'mongoose';
import { getAdminFromRequest } from '@/lib/middleware/auth';
import { validateQuestion, returnValidationError } from '@/lib/middleware/validation';
import { errorHandler } from '@/lib/middleware/errorHandler';

// GET single question
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const id = params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    const question = await Question.findById(id).lean();
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      question: {
        id: question._id.toString(),
        title: question.title,
        options: question.options,
        correctOption: question.correctOption,
        points: question.points,
        createdAt: question.createdAt,
      },
    });
  } catch (error) {
    return errorHandler(error);
  }
}

// PUT update question
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const id = params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validate input
    const validationErrors = validateQuestion(body);
    if (validationErrors.length > 0) {
      return returnValidationError(validationErrors);
    }

    const question = await Question.findByIdAndUpdate(id, body, { new: true });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      question: {
        id: question._id.toString(),
        title: question.title,
        options: question.options,
        correctOption: question.correctOption,
        points: question.points,
        createdAt: question.createdAt,
      },
    });
  } catch (error) {
    return errorHandler(error);
  }
}

// DELETE question
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const id = params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    return errorHandler(error);
  }
}

