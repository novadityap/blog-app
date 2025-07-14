import mongoose from "mongoose";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Database connected successfully');
  } catch(e) {
    logger.error('Database connection failed', { stack: e.stack });
    process.exit(1);
  }
}

export default connectDB;