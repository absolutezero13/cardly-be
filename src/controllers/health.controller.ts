import type { Request, Response } from 'express';

import { healthStatus } from '../models/health.model';

export const getHealth = (_request: Request, response: Response): void => {
  response.status(200).json(healthStatus);
};
