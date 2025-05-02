import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    const uri = process.env.NODE_ENV === 'development' ? process.env.MONGO_URI_DEV : process.env.MONGO_URI;
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Database connected successfully');
  } catch(e) {
    logger.error('Database connection failed');
    process.exit(1);
  }
}

export default connectDB;