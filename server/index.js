import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/connection.js';
import logger from './utils/logger.js';
import handleError from './middlewares/handleError.js';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import postRoute from './routes/postRoute.js';
import permissionRoute from './routes/permissionRoute.js';
import roleRoute from './routes/roleRoute.js';
import commentRoute from './routes/commentRoute.js';
import helmet from 'helmet';

const port = process.env.PORT || 3000;
const app = express();
connectDB();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/permissions', permissionRoute);
app.use('/api/roles', roleRoute);
app.use('/api/posts', postRoute);
app.use('/api/comments', commentRoute);

app.use(handleError);

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
