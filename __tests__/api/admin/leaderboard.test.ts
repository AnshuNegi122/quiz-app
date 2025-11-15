/**
 * @jest-environment node
 */

import { GET } from '@/app/api/admin/leaderboard/route';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Participant from '@/models/Participant';
import { getAdminFromRequest } from '@/lib/middleware/auth';

// Mock the database connection and auth
jest.mock('@/lib/db');
jest.mock('@/lib/middleware/auth');

describe('GET /api/admin/leaderboard', () => {
  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (getAdminFromRequest as jest.Mock).mockReturnValue(null);

    const req = new NextRequest('http://localhost:3000/api/admin/leaderboard');

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return leaderboard with pagination', async () => {
    // Mock authentication
    (getAdminFromRequest as jest.Mock).mockReturnValue({
      id: '507f1f77bcf86cd799439011',
      username: 'admin',
    });

    // Mock database connection
    (connectDB as jest.Mock).mockResolvedValue(undefined);

    // Mock Participant.find to return sample data
    const mockParticipants = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test User 1',
        email: 'test1@example.com',
        score: 100,
        submittedAt: new Date(),
      },
      {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test User 2',
        email: 'test2@example.com',
        score: 90,
        submittedAt: new Date(),
      },
    ];

    jest.spyOn(Participant, 'find').mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockParticipants),
    } as any);

    jest.spyOn(Participant, 'countDocuments').mockResolvedValue(2);

    const req = new NextRequest('http://localhost:3000/api/admin/leaderboard?page=1&limit=10');

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leaderboard).toBeDefined();
    expect(Array.isArray(data.leaderboard)).toBe(true);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(10);
  });
});

