import app from './app.js';
import connectDB from './config/connection.js';
import logger from './utils/logger.js';

const startServer = async () => {
  try {
    const port = process.env.PORT || 3000;

    await connectDB();
    app.listen(port, () => {
      logger.info(`Server started on port ${port}`);
    });
  } catch (e) {
    logger.error(`Server failed to start - ${e.message}`, { stack: e.stack });
  }
};

startServer();