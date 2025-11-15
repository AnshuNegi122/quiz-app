import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import mongoose from 'mongoose';
import { getAdminFromRequest } from '@/lib/middleware/auth';
import { validateQuestion, returnValidationError } from '@/lib/middleware/validation';
import { errorHandler } from '@/lib/middleware/errorHandler';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET single question
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const id = params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    const question = await Question.findById(id).lean();
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      question: {
        id: question._id.toString(),
        title: question.title,
        options: question.options,
        correctOption: question.correctOption,
        points: question.points,
        imageUrl: question.imageUrl || null,
        createdAt: question.createdAt,
      },
    });
  } catch (error) {
    return errorHandler(error);
  }
}

// PUT update question
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const id = params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      );
    }

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

    let finalImageUrl: string | null = null;

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
    } else if (imageUrl && imageUrl !== '') {
      // Keep existing image
      finalImageUrl = imageUrl;
    }
    // If imageUrl is empty string or null and no new file, finalImageUrl stays null (removes image)

    const updateData: any = {
      title,
      options,
      correctOption,
      points: points || 1,
      imageUrl: finalImageUrl,
    };

    const question = await Question.findByIdAndUpdate(id, updateData, { new: true });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    return errorHandler(error);
  }
}

// DELETE question
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const id = params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    return errorHandler(error);
  }
}

