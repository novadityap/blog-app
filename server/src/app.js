import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorHandler from './middlewares/errorHandler.js';
import helmet from 'helmet';
import requestLogger from './middlewares/requestLogger.js';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import postRoute from './routes/postRoute.js';
import permissionRoute from './routes/permissionRoute.js';
import roleRoute from './routes/roleRoute.js';
import commentRoute from './routes/commentRoute.js';
import categoryRoute from './routes/categoryRoute.js';
import dashboardRoute from './routes/dashboardRoute.js';

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
app.use('/uploads/avatars', express.static(process.env.AVATAR_UPLOADS_DIR));
app.use('/uploads/posts', express.static(process.env.POST_UPLOADS_DIR));

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/permissions', permissionRoute);
app.use('/api/roles', roleRoute);
app.use('/api/posts', postRoute);
app.use('/api/comments', commentRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/dashboard', dashboardRoute);

app.use(errorHandler);

export default app;
