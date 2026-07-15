import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { Env } from './config/env';
import routes from './routes';
import { errorMiddleware } from './core/middlewares/error.middleware';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: Env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use('/api/v1', routes);

app.use(errorMiddleware);

export default app;
