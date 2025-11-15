import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import { getAdminFromRequest } from '@/lib/middleware/auth';
import { validateQuestion, returnValidationError } from '@/lib/middleware/validation';
import { errorHandler } from '@/lib/middleware/errorHandler';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET all questions
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const questions = await Question.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      questions: questions.map((q) => ({
        id: q._id.toString(),
        title: q.title,
        options: q.options,
        correctOption: q.correctOption,
        points: q.points,
        imageUrl: q.imageUrl || null,
        createdAt: q.createdAt,
      })),
    });
  } catch (error) {
    return errorHandler(error);
  }
}

// POST create question
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const optionsStr = formData.get('options') as string;
    const correctOption = parseInt(formData.get('correctOption') as string);
    const points = parseInt(formData.get('points') as string) || 1;
    const imageFile = formData.get('image') as File | null;
    const imageUrl = formData.get('imageUrl') as string | null;

    const options = JSON.parse(optionsStr);

    // Validate input
    const validationErrors = validateQuestion({ title, options, correctOption, points });
    if (validationErrors.length > 0) {
      return returnValidationError(validationErrors);
    }

    let finalImageUrl: string | null = imageUrl || null;

    // Handle image upload
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filepath = join(uploadsDir, filename);

      // Save file
      await writeFile(filepath, buffer);

      // Set image URL
      finalImageUrl = `/uploads/${filename}`;
    }

    const question = new Question({
      title,
      options,
      correctOption,
      points: points || 1,
      imageUrl: finalImageUrl,
    });

    await question.save();

    return NextResponse.json(
      {
        success: true,
        question: {
          id: question._id.toString(),
          title: question.title,
          options: question.options,
          correctOption: question.correctOption,
          points: question.points,
          imageUrl: question.imageUrl || null,
          createdAt: question.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}

