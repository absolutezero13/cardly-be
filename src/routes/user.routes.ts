import { Router } from 'express';

import { getUser, saveUser } from '../controllers/user.controller';
import { requireDb } from '../middleware/requireDb';
import { verifyIdToken } from '../middleware/verifyIdToken';

const userRouter = Router();

userRouter.use(verifyIdToken, requireDb);
userRouter.post('/users', saveUser);
userRouter.get('/users/:uid', getUser);

export default userRouter;
