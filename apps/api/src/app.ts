import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import routes from './routes';
import { errorMiddleware } from './core/middlewares/error.middleware';
import { corsOptions } from './config/cors';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

app.use('/api/v1', routes);

app.use(errorMiddleware);

export default app;
