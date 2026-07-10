import { Router } from 'express';

import { saveUser } from '../controllers/user.controller';
import { requireDb } from '../middleware/requireDb';

const userRouter = Router();

userRouter.use(requireDb);
userRouter.post('/users', saveUser);

export default userRouter;
