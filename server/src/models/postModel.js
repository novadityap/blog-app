import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: String,
    content: String,
    postImage: {
      type: String,
      default: 'default.jpg',
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
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const postImageUrl = `${process.env.SERVER_URL}/uploads/posts/`;

postSchema.set('toObject', {
  transform: (doc, ret) => {
    ret.postImage = postImageUrl + ret.postImage;
    return ret;
  },
});

postSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.postImage = postImageUrl + ret.postImage;
    return ret;
  },
});

postSchema.post('aggregate', function(docs, next) {
  const [{ posts }] = docs;
  if (posts) {
    posts.forEach(post => {
      post.postImage = postImageUrl + post.postImage;
      post.user.avatar = `${process.env.SERVER_URL}/uploads/users/` + post.user.avatar;
    });
  }

  next();
});

const Post = mongoose.model('Post', postSchema);
export default Post;
