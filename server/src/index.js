import app from './app.js';
import connectDB from './utils/connection.js';
import logger from './utils/logger.js';
import './cron/deleteUnverifiedUsers.js';
import loadEnv from './utils/loadEnv.js';

(async () => {
  loadEnv();
  await connectDB();

  app.listen(process.env.PORT, '0.0.0.0', () => logger.info(`Server running on port ${process.env.PORT}`));
})();