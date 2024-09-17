import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB Connected - ${process.env.MONGO_URI}`);
  } catch(err) {
    logger.error(err);
  }
}

export default connectDB;