import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    const mongoUri = process.env.NODE_ENV === 'development' ? process.env.TEST_MONGO_URI : process.env.MONGO_URI;

    await mongoose.connect(mongoUri);
    logger.info('Database connected successfully');
  } catch(e) {
    console.log(e);
    logger.error('Database connection failed');
    process.exit(1);
  }
}

export default connectDB;