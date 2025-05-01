import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    let uri;

    switch (process.env.NODE_ENV) {
      case 'production':
        uri = process.env.MONGO_URI_PROD;
        break;
      case 'test':
        uri = process.env.MONGO_URI_TEST;
        break;
      default:
        uri = process.env.MONGO_URI_DEV;
    }

    await mongoose.connect(uri);
    logger.info('Database connected successfully');
  } catch(e) {
    console.log(e);
    logger.error('Database connection failed');
    process.exit(1);
  }
}

export default connectDB;