import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin';
import Question from '../models/Question';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Also try loading from .env if .env.local doesn't exist
if (!process.env.MONGODB_URI) {
  config({ path: resolve(process.cwd(), '.env') });
}

const MONGODB_URI = process.env.MONGODB_URI || '';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI environment variable is not defined.');
  console.error('');
  console.error('Please create a .env.local file in the root directory with:');
  console.error('  MONGODB_URI=your_mongodb_connection_string');
  console.error('  ADMIN_USERNAME=admin');
  console.error('  ADMIN_PASSWORD=your_password');
  console.error('');
  console.error('Example:');
  console.error('  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/frostbyte?retryWrites=true&w=majority');
  process.exit(1);
}

// const sampleQuestions = [
//   {
//     title: 'What does HTML stand for?',
//     options: [
//       'Hyper Text Markup Language',
//       'High Tech Modern Language',
//       'Home Tool Markup Language',
//       'Hyperlinks and Text Markup Language',
//     ],
//     correctOption: 0,
//     points: 1,
//   },
//   {
//     title: 'Which of the following is a JavaScript framework?',
//     options: ['React', 'Django', 'Laravel', 'Flask'],
//     correctOption: 0,
//     points: 1,
//   },
//   {
//     title: 'What is the purpose of CSS?',
//     options: [
//       'To style HTML elements',
//       'To create databases',
//       'To perform calculations',
//       'To manage server requests',
//     ],
//     correctOption: 0,
//     points: 1,
//   },
//   {
//     title: 'Which language is known as the language of web?',
//     options: ['Python', 'JavaScript', 'Java', 'C++'],
//     correctOption: 1,
//     points: 1,
//   },
//   {
//     title: 'What does API stand for?',
//     options: [
//       'Application Programming Interface',
//       'Advanced Programming Integration',
//       'Application Process Integration',
//       'Advanced Process Interface',
//     ],
//     correctOption: 0,
//     points: 1,
//   },
// ];

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    console.log('');
    console.log(`📝 Admin Username: ${ADMIN_USERNAME}`);
    console.log(`🔗 MongoDB URI: ${MONGODB_URI.substring(0, 30)}...`);
    console.log('');

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    const adminCount = await Admin.countDocuments();
    const questionCount = await Question.countDocuments();
    
    if (adminCount > 0 || questionCount > 0) {
      await Admin.deleteMany({});
      await Question.deleteMany({});
      console.log(`✅ Cleared ${adminCount} admin(s) and ${questionCount} question(s)`);
    } else {
      console.log('ℹ️  No existing data to clear');
    }
    console.log('');

    // Create admin user
    console.log('👤 Creating admin user...');
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admin = new Admin({
      username: ADMIN_USERNAME,
      passwordHash,
      role: 'admin',
    });
    await admin.save();
    console.log(`✅ Admin user created: ${ADMIN_USERNAME}`);
    console.log('');

    // Create sample questions
    console.log('❓ Creating sample questions...');
    // const questions = await Question.insertMany(sampleQuestions);
    // console.log(`✅ Created ${questions.length} questions`);
    console.log('');

    console.log('🎉 Seed completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('  1. Start the development server: npm run dev');
    console.log(`  2. Login to admin panel: http://localhost:3000/admin/login`);
    console.log(`  3. Username: ${ADMIN_USERNAME}`);
    console.log(`  4. Password: ${ADMIN_PASSWORD}`);
    console.log('');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error seeding database:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error('   Unknown error occurred');
    }
    console.error('');
    console.error('💡 Tips:');
    console.error('  - Check your MongoDB connection string');
    console.error('  - Ensure MongoDB Atlas IP whitelist includes your IP');
    console.error('  - Verify your database credentials');
    console.error('');
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seed();

