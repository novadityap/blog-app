import mongoose from 'mongoose';
import crypto from 'crypto';

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
      default: 'default.jpg',
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

const avatarUrl = `${process.env.SERVER_URL}/uploads/avatars/`;

userSchema.set('toObject', {
  transform: (doc, ret) => {
    if (!ret.avatar.startsWith(avatarUrl)) ret.avatar = avatarUrl + ret.avatar;
    delete ret.password;
    return ret;
  },
});

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (!ret.avatar.startsWith(avatarUrl)) ret.avatar = avatarUrl + ret.avatar;
    delete ret.password;
    return ret;
  },
});

userSchema.post('aggregate', function (docs, next) {
  const [{ users }] = docs;
  users.forEach(user => {
    user.avatar = avatarUrl + user.avatar;
    delete user.password;
  });

  next();
});

userSchema.pre(
  'findByIdAndDelete',
  { document: false, query: true },
  async function (next) {
    const userId = this.getQuery()._id;
    await mongoose.model('Post').deleteMany({ user: userId });
    await mongoose.model('Comment').deleteMany({ user: userId });
    next();
  }
);

const User = mongoose.model('User', userSchema);
export default User;
