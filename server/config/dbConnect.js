import mongoose from "mongoose";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB Connected`);
  } catch(e) {
    logger.error(e);
  }
}

export default connectDB;