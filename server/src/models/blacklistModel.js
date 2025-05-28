import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema({
  token: String,
  blacklistedAt: {
    type: Date,
    default: Date.now()
  }
});

export default mongoose.model('Blacklist', blacklistSchema);