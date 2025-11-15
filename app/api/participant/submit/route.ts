import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import Participant from '@/models/Participant';
import { validateParticipantSubmit, returnValidationError } from '@/lib/middleware/validation';
import { errorHandler } from '@/lib/middleware/errorHandler';
import { AppError } from '@/lib/middleware/errorHandler';
import { submitRateLimit } from '@/lib/middleware/rateLimit';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = submitRateLimit(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    await connectDB();

    const body = await req.json();

    // Validate input
    const validationErrors = validateParticipantSubmit(body);
    if (validationErrors.length > 0) {
      return returnValidationError(validationErrors);
    }

    const { name, email, answers } = body;

    // Check if participant already exists
    const existingParticipant = await Participant.findOne({ email: email.toLowerCase() });
    if (existingParticipant) {
      throw new AppError('You have already taken this quiz. Only one attempt is allowed.', 400);
    }

    // Get all questions to calculate score
    const questions = await Question.find().lean();

    if (questions.length === 0) {
      throw new AppError('No questions available', 400);
    }

    // Calculate score on server
    let totalScore = 0;
    let maxScore = 0;

    const validatedAnswers = answers.map((answer: any) => {
      const question = questions.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );

      if (!question) {
        throw new AppError(`Question ${answer.questionId} not found`, 400);
      }

      maxScore += question.points;

      const isCorrect = question.correctOption === answer.answer;
      if (isCorrect) {
        totalScore += question.points;
      }

      return {
        questionId: new mongoose.Types.ObjectId(answer.questionId),
        answer: answer.answer,
      };
    });

    // Calculate percentage score
    const percentageScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Create participant record
    const participant = new Participant({
      name,
      email: email.toLowerCase(),
      answers: validatedAnswers,
      score: percentageScore,
      submittedAt: new Date(),
      attemptCount: 1,
    });

    await participant.save();

    return NextResponse.json(
      {
        success: true,
        participant: {
          id: participant._id.toString(),
          name: participant.name,
          score: participant.score,
          submittedAt: participant.submittedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}

