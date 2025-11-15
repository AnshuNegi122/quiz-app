import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
}

export interface AuthRequest extends NextRequest {
  admin?: {
    id: string;
    username: string;
    role: 'admin';
  };
}

export function verifyToken(token: string): { id: string; username: string; role: 'admin' } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: 'admin' };
    if (decoded.role !== 'admin') return null;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function generateToken(admin: { id: string; username: string; role: 'admin' }): string {
  return jwt.sign(admin, JWT_SECRET, { expiresIn: '7d' });
}

export function authMiddleware(handler: (req: AuthRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const token = req.cookies.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = verifyToken(token);

    if (!admin) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // strictly require admin role
    if (admin.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    (req as AuthRequest).admin = admin;

    return handler(req as AuthRequest);
  };
}

export function getAdminFromRequest(req: NextRequest): { id: string; username: string; role: 'admin' } | null {
  const token = req.cookies.get('adminToken')?.value;
  if (!token) {
    return null;
  }
  return verifyToken(token);
}
