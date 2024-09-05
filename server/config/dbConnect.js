import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB Connected`);
  } catch(e) {
    logger.error(e);
  }
}

export default connectDB;