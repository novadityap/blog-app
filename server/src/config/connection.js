import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info(`Database connected successfully`);
  } catch(e) {
    logger.error(`Database connection failed - ${e.message}`);
  }
}

export default connectDB;