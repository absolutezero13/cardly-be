import type { NextFunction, Request, Response } from 'express';

import { connectDB } from '../config/db';

/** Ensures a (cached) MongoDB connection before DB-backed handlers run. */
export async function requireDb(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    response.status(503).json({ error: 'Database unavailable' });
  }
}
