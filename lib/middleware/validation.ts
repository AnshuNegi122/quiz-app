import { NextResponse } from 'next/server';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateQuestion(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (!Array.isArray(data.options) || data.options.length !== 4) {
    errors.push({ field: 'options', message: 'Options must be an array of exactly 4 items' });
  } else {
    data.options.forEach((opt: any, index: number) => {
      if (!opt || typeof opt !== 'string' || opt.trim().length === 0) {
        errors.push({ field: `options[${index}]`, message: 'Each option must not be empty' });
      }
    });
  }

  if (
    typeof data.correctOption !== 'number' ||
    data.correctOption < 0 ||
    data.correctOption > 3 ||
    !Number.isInteger(data.correctOption)
  ) {
    errors.push({ field: 'correctOption', message: 'Correct option must be an integer between 0 and 3' });
  }

  if (data.points !== undefined) {
    if (typeof data.points !== 'number' || data.points < 1 || !Number.isInteger(data.points)) {
      errors.push({ field: 'points', message: 'Points must be an integer at least 1' });
    }
  }

  return errors;
}

export function validateAdminLogin(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.username || typeof data.username !== 'string' || data.username.trim().length === 0) {
    errors.push({ field: 'username', message: 'Username is required' });
  }

  if (!data.password || typeof data.password !== 'string' || data.password.length === 0) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
}

export function validateParticipantStart(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }
  }

  return errors;
}

export function validateParticipantSubmit(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }
  }

  if (!Array.isArray(data.answers) || data.answers.length === 0) {
    errors.push({ field: 'answers', message: 'Answers must be a non-empty array' });
  } else {
    data.answers.forEach((answer: any, index: number) => {
      if (!answer.questionId) {
        errors.push({ field: `answers[${index}].questionId`, message: 'Question ID is required' });
      }
      if (
        typeof answer.answer !== 'number' ||
        answer.answer < 0 ||
        answer.answer > 3 ||
        !Number.isInteger(answer.answer)
      ) {
        errors.push({ field: `answers[${index}].answer`, message: 'Answer must be an integer between 0 and 3' });
      }
    });
  }

  return errors;
}

export function returnValidationError(errors: ValidationError[]): NextResponse {
  return NextResponse.json(
    { error: 'Validation failed', errors },
    { status: 400 }
  );
}
