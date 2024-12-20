import app from './app.js';
import connectDB from './config/connection.js';
import 'dotenv/config';
import logger from './utils/logger.js';

(async () => {
  const port = process.env.PORT || 3000;

  await connectDB();
  app.listen(port, () => logger.info(`Server running on port ${port}`));
})();