import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    title: String,
    content: String,
    postImage: {
      type: String,
      default: 'default.jpg',
    },
    category: {
      type: String,
      default: 'Uncategorized',
    },
    slug: String,
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }]
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.postImage = `${process.env.SERVER_URL}/${process.env.POST_UPLOADS_DIR}/${ret.postImage}`;
        return ret;
      }
    }
  }
);

const Post = mongoose.model('Post', postSchema);
export default Post;
