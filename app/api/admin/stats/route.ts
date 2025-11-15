import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import Participant from '@/models/Participant';
import { getAdminFromRequest } from '@/lib/middleware/auth';
import { errorHandler } from '@/lib/middleware/errorHandler';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Get statistics
    const totalQuestions = await Question.countDocuments();
    const totalParticipants = await Participant.countDocuments();

    // Get top score
    const topParticipant = await Participant.findOne().sort({ score: -1 });
    const topScore = topParticipant ? topParticipant.score : 0;

    // Calculate average score
    const avgResult = await Participant.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$score' },
        },
      },
    ]);
    const avgScore = avgResult.length > 0 ? Math.round(avgResult[0].avgScore) : 0;

    return NextResponse.json({
      totalQuestions,
      totalParticipants,
      topScore,
      avgScore,
    });
  } catch (error) {
    return errorHandler(error);
  }
}
