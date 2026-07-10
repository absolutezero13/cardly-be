import 'dotenv/config';

import express from 'express';

import healthRouter from './routes/health.routes';
import userRouter from './routes/user.routes';

const app = express();

app.use(express.json());
app.use(healthRouter);
app.use(userRouter);

export default app;
