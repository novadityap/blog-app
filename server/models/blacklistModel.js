import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  blacklistedAt: {
    type: Date,
    default: Date.now()
  }
});

export default mongoose.model('Blacklist', blacklistSchema);