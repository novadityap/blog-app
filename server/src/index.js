import app from './app.js';
import connectDB from './utils/connection.js';
import logger from './utils/logger.js';
import './cron/deleteUnverifiedUsers.js';
import dotenv from 'dotenv'

(async () => {
  dotenv.config({ path: '.env.development'});
  await connectDB();

  app.listen(process.env.PORT, '0.0.0.0', () => logger.info(`Server running on port ${process.env.PORT}`));
})();