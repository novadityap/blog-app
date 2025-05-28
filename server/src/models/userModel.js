import mongoose from 'mongoose';
import crypto from 'crypto';
import cloudinary from '../utils/cloudinary.js';
import extractPublicId from '../utils/extractPublicId.js';

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
    },
    avatar: {
      type: String,
      default: process.env.DEFAULT_AVATAR_URL,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: () => crypto.randomBytes(32).toString('hex'),
    },
    verificationTokenExpires: {
      type: Date,
      default: () => Date.now() + 24 * 60 * 60 * 1000,
    },
    resetToken: String,
    resetTokenExpires: Date,
    refreshToken: String,
  },
  {
    timestamps: true,
  }
);

userSchema.set('toObject', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

userSchema.pre(
  'findByIdAndDelete',
  { document: false, query: true },
  async function (next) {
    const userId = this.getQuery()._id;

    const posts = await mongoose.model('Post').find({ user: userId });

    const postPublicIds = posts
      .map(post => extractPublicId(post.postImage))
      .filter(publicId => publicId !== null);

    if (postPublicIds.length > 0)
      await cloudinary.api.delete_resources(postPublicIds);

    await mongoose.model('Post').deleteMany({ user: userId });
    await mongoose.model('Comment').deleteMany({ user: userId });
    next();
  }
);

const User = mongoose.model('User', userSchema);
export default User;
