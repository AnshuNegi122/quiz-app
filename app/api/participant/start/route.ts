import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Participant from '@/models/Participant';
import { validateParticipantStart, returnValidationError } from '@/lib/middleware/validation';
import { errorHandler } from '@/lib/middleware/errorHandler';
import { AppError } from '@/lib/middleware/errorHandler';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    // Validate input
    const validationErrors = validateParticipantStart(body);
    if (validationErrors.length > 0) {
      return returnValidationError(validationErrors);
    }

    const { name, email } = body;

    // Check if participant already exists
    const existingParticipant = await Participant.findOne({ email: email.toLowerCase() });
    if (existingParticipant) {
      throw new AppError('Email already registered. You can only take the quiz once.', 400);
    }

    // Create participant (but don't save yet - they'll be saved on submit)
    // For now, we'll just return success and store the email in a session token
    // In a real app, you might want to create a session or temporary record

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
    });
  } catch (error) {
    return errorHandler(error);
  }
}

