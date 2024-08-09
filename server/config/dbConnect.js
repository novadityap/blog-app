import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected`);
  } catch(e) {
    console.log(e);
  }
}

export default connectDB;