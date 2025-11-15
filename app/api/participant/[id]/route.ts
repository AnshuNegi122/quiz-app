import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Participant from '@/models/Participant';
import mongoose from 'mongoose';
import { errorHandler } from '@/lib/middleware/errorHandler';

// GET participant by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const id = params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid participant ID' },
        { status: 400 }
      );
    }

    const participant = await Participant.findById(id, 'name email score answers submittedAt').lean();

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      participant: {
        id: participant._id.toString(),
        name: participant.name,
        email: participant.email,
        score: participant.score,
        answers: participant.answers,
        submittedAt: participant.submittedAt,
      },
    });
  } catch (error) {
    return errorHandler(error);
  }
}

