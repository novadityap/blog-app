import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  token: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  expiresAt: Date,
});

export default mongoose.model('RefreshToken', refreshTokenSchema);