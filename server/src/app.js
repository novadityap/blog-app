import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorHandler from './middlewares/errorHandler.js';
import helmet from 'helmet';
import requestLogger from './middlewares/requestLogger.js';
import apiRouter from './routes/api.js';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads/avatars', express.static(process.env.AVATAR_DIR));
app.use('/uploads/posts', express.static(process.env.POST_DIR));

app.use('/api', apiRouter);

app.use(errorHandler);

export default app;
