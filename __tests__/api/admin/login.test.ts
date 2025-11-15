/**
 * @jest-environment node
 */

import { POST } from '@/app/api/admin/login/route';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

// Mock the database connection
jest.mock('@/lib/db');

describe('POST /api/admin/login', () => {
  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should return 400 if username is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'password' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 if password is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 401 if credentials are invalid', async () => {
    // Mock database connection
    (connectDB as jest.Mock).mockResolvedValue(undefined);

    // Mock Admin.findOne to return null (user not found)
    jest.spyOn(Admin, 'findOne').mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'wrongpassword' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid credentials');
  });

  it('should return 200 and set cookie on successful login', async () => {
    // Mock database connection
    (connectDB as jest.Mock).mockResolvedValue(undefined);

    // Mock Admin.findOne to return a user
    const passwordHash = await bcrypt.hash('password123', 10);
    const mockAdmin = {
      _id: '507f1f77bcf86cd799439011',
      username: 'admin',
      passwordHash,
      role: 'admin',
    };

    jest.spyOn(Admin, 'findOne').mockResolvedValue(mockAdmin);

    const req = new NextRequest('http://localhost:3000/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'password123' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.admin).toBeDefined();
    expect(data.admin.username).toBe('admin');

    // Check if cookie is set
    const cookies = response.headers.get('set-cookie');
    expect(cookies).toContain('adminToken');
  });
});

