import logger from '../utils/logger.js';
import Comment from '../models/commentModel.js';
import Post from '../models/postModel.js';
import ResponseError from '../utils/responseError.js';
import validate from '../utils/validate.js';
import {
  createCommentSchema,
  updateCommentSchema,
  getCommentSchema,
  searchCommentSchema,
} from '../validations/commentValidation.js';
import { getPostSchema } from '../validations/postValidation.js';
import checkOwnership from '../utils/checkOwnership.js';

const validatePostId = async id => {
  const postId = validate(getPostSchema, id);

  const post = await Post.findById(postId);
  if (!post) {
    logger.warn('post not found');
    throw new ResponseError('Post not found', 404);
  }

  return postId;
};

const create = async (req, res, next) => {
  try {
    const postId = await validatePostId(req.params.postId);
    const fields = validate(createCommentSchema, req.body);

    await Comment.create({
      ...fields,
      post: postId,
      user: req.user.id,
    });

    logger.info('comment created successfully');
    res.status(201).json({
      code: 201,
      message: 'Comment created successfully',
    });
  } catch (e) {
    next(e);
  }
};

const listByPost = async (req, res, next) => {
  try {
    const postId = await validatePostId(req.params.postId);
    const comments = await Comment.find({ post: postId }).populate({
      path: 'user',
      select: 'username email avatar',
    });

    if (comments.length === 0) {
      logger.info('no comments found');
      return res.json({
        code: 200,
        message: 'No comments found',
        data: [],
      });
    }

    logger.info('comments retrieved successfully');
    res.json({
      code: 200,
      message: 'Comments retrieved successfully',
      data: comments,
    });
  } catch (e) {
    next(e);
  }
};

const search = async (req, res, next) => {
  try {
    const query = validate(searchCommentSchema, req.query);
    const { page, limit, q } = query;

    const [{ comments, totalComments }] = await Comment.aggregate()
      .lookup({
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [{ $project: { username: 1 } }],
      })
      .lookup({
        from: 'posts',
        localField: 'post',
        foreignField: '_id',
        as: 'post',
        pipeline: [{ $project: { title: 1 } }],
      })
      .match(
        q
          ? {
              $or: [
                { text: { $regex: q, $options: 'i' } },
                { 'user.username': { $regex: q, $options: 'i' } },
                { 'post.title': { $regex: q, $options: 'i' } },
              ],
            }
          : {}
      )
      .unwind('user')
      .unwind('post')
      .facet({
        comments: [
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ],
        totalComments: [{ $count: 'count' }],
      })
      .project({
        comments: 1,
        totalComments: {
          $ifNull: [{ $arrayElemAt: ['$totalComments.count', 0] }, 0],
        },
      });

    if (comments.length === 0) {
      logger.info('no comments found');
      return res.json({
        code: 200,
        message: 'No comments found',
        data: [],
        meta: {
          pageSize: limit,
          totalItems: 0,
          currentPage: page,
          totalPages: 1,
        },
      });
    }

    res.json({
      code: 200,
      message: 'Comments retrieved successfully',
      data: comments,
      meta: {
        pageSize: limit,
        totalItems: totalComments,
        currentPage: page,
        totalPages: Math.ceil(totalComments / limit),
      },
    });
  } catch (e) {
    next(e);
  }
};

const show = async (req, res, next) => {
  try {
    await validatePostId(req.params.postId);
    const commentId = validate(getCommentSchema, req.params.commentId);

    const comment = await Comment.findById(commentId);
    if (!comment) {
      logger.warn('comment not found');
      throw new ResponseError('Comment not found', 404);
    }

    logger.info('comment retrieved successfully');
    res.json({
      code: 200,
      message: 'Comment retrieved successfully',
      data: comment,
    });
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    await validatePostId(req.params.postId);
    const commentId = validate(getCommentSchema, req.params.commentId);
    const fields = validate(updateCommentSchema, req.body);

    const comment = await Comment.findByIdAndUpdate(commentId, fields, {
      new: true,
    });
    if (!comment) {
      logger.warn('comment not found');
      throw new ResponseError('Comment not found', 404);
    }

    logger.info('comment updated successfully');
    res.json({
      code: 200,
      message: 'Comment updated successfully',
      data: comment,
    });
  } catch (e) {
    next(e);
  }
};

const remove = async (req, res, next) => {
  try {
    await validatePostId(req.params.postId);
    const commentId = validate(getCommentSchema, req.params.commentId);

    await checkOwnership(Comment, commentId, req.user);

    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) {
      logger.warn('comment not found');
      throw new ResponseError('Comment not found', 404);
    }

    logger.info('comment deleted successfully');
    res.json({
      code: 200,
      message: 'Comment deleted successfully',
      data: comment,
    });
  } catch (e) {
    next(e);
  }
};

export default { create, show, update, remove, search, listByPost };
