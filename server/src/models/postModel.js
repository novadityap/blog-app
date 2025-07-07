import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: String,
    content: String,
    image: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    slug: String,
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    totalLikes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.pre(
  'findByIdAndDelete',
  { document: false, query: true },
  async function (next) {
    const postId = this.getQuery()._id;
    await mongoose.model('Comment').deleteMany({ post: postId });
    next();
  }
);

postSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});


const Post = mongoose.model('Post', postSchema);
export default Post;
