import { existsSync } from 'fs';
import { resolve } from 'path';

const envLocalPath = resolve(process.cwd(), '.env.local');
const envExamplePath = resolve(process.cwd(), 'env.example');

console.log('🔍 Checking environment configuration...');
console.log('');

if (!existsSync(envLocalPath)) {
  console.log('❌ .env.local file not found!');
  console.log('');
  console.log('📝 To create .env.local:');
  console.log('');
  console.log('   1. Copy env.example to .env.local:');
  console.log('      cp env.example .env.local');
  console.log('');
  console.log('   2. Edit .env.local and add your MongoDB connection string:');
  console.log('      MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/frostbyte?retryWrites=true&w=majority');
  console.log('');
  console.log('   3. Set your admin credentials:');
  console.log('      ADMIN_USERNAME=admin');
  console.log('      ADMIN_PASSWORD=your_secure_password');
  console.log('');
  console.log('   4. Set your JWT secret:');
  console.log('      JWT_SECRET=your-random-secret-key');
  console.log('');
  console.log('💡 For MongoDB Atlas setup:');
  console.log('   - Create a free cluster at https://www.mongodb.com/cloud/atlas');
  console.log('   - Create a database user');
  console.log('   - Whitelist your IP address (or use 0.0.0.0/0 for development)');
  console.log('   - Get the connection string from "Connect" → "Connect your application"');
  console.log('');
  process.exit(1);
} else {
  console.log('✅ .env.local file found');
  console.log('');
  console.log('💡 You can now run: npm run seed');
  console.log('');
  process.exit(0);
}

