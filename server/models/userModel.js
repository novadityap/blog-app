import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: 'default.jpg'
  },
  isVerified: {
    type: Boolean,
    required: true,
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
  resetToken: {
    type: String
  },
  resetTokenExpires: {
    type: Date,
  },
  refreshToken: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.avatar = `${process.env.SERVER_URL}/${process.env.AVATAR_UPLOADS_DIR}/${ret.avatar}`;

      delete ret.password;
      delete ret.verificationToken;
      delete ret.verificationTokenExpires;
      delete ret.resetToken;
      delete ret.resetTokenExpires;
      delete ret.refreshToken;
      return ret;
    }
  }
});

const User = mongoose.model('User', userSchema);
export default User;
