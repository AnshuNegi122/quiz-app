import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
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

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Get leaderboard sorted by score (desc) then submittedAt (asc)
    const participants = await Participant.find()
      .sort({ score: -1, submittedAt: 1 })
      .skip(skip)
      .limit(limit)
      .select('name email score submittedAt')
      .lean();

    // Get total count
    const total = await Participant.countDocuments();

    // Calculate rank
    const leaderboard = participants.map((participant, index) => {
      // Obfuscate email (show first 3 chars and domain)
      const emailParts = participant.email.split('@');
      const obfuscatedEmail =
        emailParts[0].substring(0, 3) + '***@' + emailParts[1];

      // Calculate time taken (if we had start time, we'd calculate duration)
      // For now, we'll use a placeholder
      const timeTaken = 'N/A';

      return {
        rank: skip + index + 1,
        name: participant.name,
        email: obfuscatedEmail,
        score: participant.score,
        time: timeTaken,
        submittedAt: participant.submittedAt,
      };
    });

    return NextResponse.json({
      leaderboard,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return errorHandler(error);
  }
}

