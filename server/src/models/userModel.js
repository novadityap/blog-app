import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
  },
  avatar: {
    type: String,
    default: 'default.jpg'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: () => crypto.randomBytes(32).toString('hex')
  },
  verificationTokenExpires: {
    type: Date,
    default: () => Date.now() + (24 * 60 * 60 * 1000)
  },
  resetToken: String,
  resetTokenExpires: Date,
  refreshToken: String
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.avatar = `${process.env.SERVER_URL}/uploads/avatars/${ret.avatar}`;

      delete ret.password;
      delete ret.verificationToken;
      delete ret.verificationTokenExpires;
      delete ret.resetToken;
      delete ret.resetTokenExpires;
      delete ret.refreshToken;
      return ret;
    }
  },
  virtuals: {
    avatarUrl: {
      get() {
        return `${process.env.SERVER_URL}/uploads/avatars/${this.avatar}`;
      }
    }
  }
});

const User = mongoose.model('User', userSchema);
export default User;
