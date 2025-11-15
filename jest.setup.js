// Jest setup file
// This file is executed before each test file

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/frostbyte-test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.ADMIN_USERNAME = 'test-admin';
process.env.ADMIN_PASSWORD = 'test-password';

// Suppress console errors in tests (optional)
// global.console = {
//   ...console,
//   error: jest.fn(),
//   warn: jest.fn(),
// };

