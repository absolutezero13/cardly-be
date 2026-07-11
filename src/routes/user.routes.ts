import { Router } from 'express';

import { getUser, saveUser } from '../controllers/user.controller';
import { requireDb } from '../middleware/requireDb';

const userRouter = Router();

userRouter.use(requireDb);
userRouter.post('/users', saveUser);
userRouter.get('/users/:uid', getUser);

export default userRouter;
