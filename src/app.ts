import 'dotenv/config';

import express from 'express';

import cardRouter from './routes/card.routes';
import collectionRouter from './routes/collection.routes';
import healthRouter from './routes/health.routes';
import userRouter from './routes/user.routes';

const app = express();

app.use(express.json());
app.use(healthRouter);
app.use(cardRouter);
app.use(collectionRouter);
app.use(userRouter);

export default app;
