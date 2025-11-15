/**
 * @jest-environment node
 */

import { POST } from '@/app/api/participant/submit/route';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import Participant from '@/models/Participant';
import mongoose from 'mongoose';

// Mock the database connection
jest.mock('@/lib/db');

describe('POST /api/participant/submit', () => {
  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should return 400 if validation fails', async () => {
    const req = new NextRequest('http://localhost:3000/api/participant/submit', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test User' }), // Missing email and answers
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 if participant already exists', async () => {
    // Mock database connection
    (connectDB as jest.Mock).mockResolvedValue(undefined);

    // Mock Participant.findOne to return existing participant
    const mockParticipant = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test User',
      email: 'test@example.com',
    };

    jest.spyOn(Participant, 'findOne').mockResolvedValue(mockParticipant);

    const req = new NextRequest('http://localhost:3000/api/participant/submit', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        answers: [{ questionId: '507f1f77bcf86cd799439012', answer: 0 }],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('already taken');
  });

  it('should calculate score correctly and create participant', async () => {
    // Mock database connection
    (connectDB as jest.Mock).mockResolvedValue(undefined);

    // Mock Participant.findOne to return null (new participant)
    jest.spyOn(Participant, 'findOne').mockResolvedValue(null);

    // Mock Question.find to return sample questions
    const questionId = new mongoose.Types.ObjectId();
    const mockQuestions = [
      {
        _id: questionId,
        title: 'Test Question',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctOption: 0,
        points: 1,
      },
    ];

    jest.spyOn(Question, 'find').mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockQuestions),
    } as any);

    // Mock Participant constructor and save
    const mockParticipant = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test User',
      email: 'test@example.com',
      score: 100,
      save: jest.fn().mockResolvedValue(undefined),
    };

    jest.spyOn(Participant.prototype, 'save').mockResolvedValue(mockParticipant);

    const req = new NextRequest('http://localhost:3000/api/participant/submit', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        answers: [{ questionId: questionId.toString(), answer: 0 }],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.participant).toBeDefined();
    expect(data.participant.score).toBeGreaterThanOrEqual(0);
  });
});

