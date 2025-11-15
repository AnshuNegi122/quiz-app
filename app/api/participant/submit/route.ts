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
    const questions = await Question.find().sort({ createdAt: 1 }).lean();

    if (questions.length === 0) {
      throw new AppError('No questions available', 400);
    }

    // Calculate score on server - count correct answers
    let correctCount = 0;
    let totalQuestions = questions.length;

    // Create a map of submitted answers by questionId
    const answerMap = new Map();
    answers.forEach((answer: any) => {
      answerMap.set(answer.questionId.toString(), answer.answer);
    });

    // Check each question
    questions.forEach((question) => {
      const submittedAnswer = answerMap.get(question._id.toString());
      if (submittedAnswer !== undefined && submittedAnswer === question.correctOption) {
        correctCount++;
      }
    });

    // Calculate percentage score
    const percentageScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Duration: derive from submittedAt - startedAt if provided by client/local, but we prefer server computed.
    // If client provided a startedAt header or we stored one in a future enhancement, we could use it.
    // For now, accept startedAt from body optionally and compute duration.
    let durationSeconds = 0;
    if (body.startedAt) {
      const startedAtDate = new Date(body.startedAt);
      if (!isNaN(startedAtDate.getTime())) {
        durationSeconds = Math.max(0, Math.round((Date.now() - startedAtDate.getTime()) / 1000));
      }
    }

    // Map answers for storage
    const validatedAnswers = answers.map((answer: any) => {
      const question = questions.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );

      if (!question) {
        throw new AppError(`Question ${answer.questionId} not found`, 400);
      }

      return {
        questionId: new mongoose.Types.ObjectId(answer.questionId),
        answer: answer.answer,
      };
    });

    // Create participant record
    const participant = new Participant({
      name,
      email: email.toLowerCase(),
      answers: validatedAnswers,
      score: percentageScore,
      submittedAt: new Date(),
      attemptCount: 1,
      startedAt: body.startedAt ? new Date(body.startedAt) : undefined,
      durationSeconds,
    });

    await participant.save();

    return NextResponse.json(
      {
        success: true,
        participant: {
          id: participant._id.toString(),
          name: participant.name,
          score: participant.score,
          correctCount: correctCount,
          totalQuestions: totalQuestions,
          submittedAt: participant.submittedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}

