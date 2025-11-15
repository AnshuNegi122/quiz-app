import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Participant from '@/models/Participant';
import { errorHandler } from '@/lib/middleware/errorHandler';

// GET /api/participant/status?email=...
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const exists = await Participant.exists({ email: email.toLowerCase() });

    return NextResponse.json({ hasTaken: Boolean(exists) });
  } catch (error) {
    return errorHandler(error);
  }
}
