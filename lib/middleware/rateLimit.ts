import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (for production, use Redis or a dedicated service)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests per window
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests } = options;

  return (req: NextRequest) => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return null;
    }

    if (record.count >= maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { status: 429 }
      );
    }

    record.count++;
    return null;
  };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60000); // Clean up every minute

// Common rate limiters
export const loginRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5 }); // 5 requests per 15 minutes
export const submitRateLimit = rateLimit({ windowMs: 60 * 1000, maxRequests: 3 }); // 3 requests per minute
export const apiRateLimit = rateLimit({ windowMs: 60 * 1000, maxRequests: 100 }); // 100 requests per minute

