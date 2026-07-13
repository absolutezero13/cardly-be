import type { Request } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';

declare global {
  namespace Express {
    interface Request {
      auth?: DecodedIdToken;
    }
  }
}

export function getAuthUid(request: Request): string {
  if (!request.auth?.uid) {
    throw new Error('Request is not authenticated');
  }

  return request.auth.uid;
}
