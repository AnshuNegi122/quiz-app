import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/middleware/auth';
import { validateAdminLogin, returnValidationError } from '@/lib/middleware/validation';
import { loginRateLimit } from '@/lib/middleware/rateLimit';
import { errorHandler } from '@/lib/middleware/errorHandler';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = loginRateLimit(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Connect to database
    await connectDB();

    // Parse request body
    const body = await req.json();

    // Validate input
    const validationErrors = validateAdminLogin(body);
    if (validationErrors.length > 0) {
      return returnValidationError(validationErrors);
    }

    const { username, password } = body;

    // Find admin
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      id: admin._id.toString(),
      username: admin.username,
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        username: admin.username,
      },
    });

    // Set httpOnly cookie
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return errorHandler(error);
  }
}

