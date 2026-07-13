import type { NextFunction, Request, Response } from 'express';

import { getFirebaseAuth } from '../config/firebase';

export async function verifyIdToken(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const bearerToken = request.headers.authorization;

    if (!bearerToken?.startsWith('Bearer ')) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = bearerToken.slice('Bearer '.length).trim();

    if (!token) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }

    request.auth = await getFirebaseAuth().verifyIdToken(token);
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    response.status(401).json({ error: 'Unauthorized' });
  }
}
