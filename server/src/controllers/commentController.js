import logger from '../utils/logger.js';
import Comment from '../models/commentModel.js';
import User from '../models/userModel.js';
import Post from '../models/postModel.js';
import ResponseError from '../utils/responseError.js';
import validateSchema from '../utils/validateSchema.js';
import {
  createCommentSchema,
  updateCommentSchema,
} from '../validations/commentValidation.js';
import validateObjectId from '../utils/validateObjectId.js';

export const createComment = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed post id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed post id'] });
    }

    const { validatedFields, validationErrors } = validateSchema(
      createCommentSchema,
      req.body
    );

    if (validationErrors) {
      logger.info('create comment failed - invalid request fields');
      throw new ResponseError('Validation errors', 400, validationErrors);
    }

    const comment = await Comment.create({
      ...validatedFields,
      postId: req.params.id
    });

    logger.info(`create comment success - comment created with id ${comment._id}`);
    res.json({
      code: 200,
      message: 'Comment created successfully',
    });
  } catch (err) {
    next(err);
  }
}
export const getComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.search) {
      const users = await User.find({ username: { $regex: req.query.search, $options: 'i' } }).select('_id');
      const posts = await Post.find({ title: { $regex: req.query.search, $options: 'i' } }).select('_id');

      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
        { userId: { in: users.map(user => user._id) } },
        { postId: { in: posts.map(post => post._id) } }
      ];
    }

    const totalComments = await Comment.countDocuments(filter);
    const totalPages = Math.ceil(totalComments / limit);

    const comments = await Comment.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email')
      .populate('postId', 'title');

    if (comments.length === 0) {
      logger.info('resource not found - no comments found in database');
      return res.json({
        code: 200,
        message: 'No comments found',
        data: [],
      });
    }

    res.json({
      code: 200,
      message: 'Comments fetched successfully',
      data: comments,
      meta: {
        pageSize: limit,
        totalItems: totalComments,
        currentPage: page,
        totalPages,
      }
    });
  } catch (err) {
    next(err);
  }
}
export const updateComment = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed comment id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed comment id'] });
    }

    const { validatedFields, validationErrors } = validateSchema(updateCommentSchema, req.body);

    if (validationErrors) {
      logger.info('update comment failed - invalid request fields');
      throw new ResponseError('Validation errors', 400, validationErrors);
    }

    const updatedComment = await Comment.findOneAndUpdate(
      { _id: req.params.id },
      { ...validatedFields },
      { new: true }
    );

    if (!updatedComment) {
      logger.info(`resource not found - comment with id ${req.params.id} not found`);
      throw new ResponseError('Resource not found', 404);
    }

    logger.info(`update comment success - comment updated with id ${req.params.id}`);
    res.json({
      code: 200,
      message: 'Comment updated successfully',
      data: updatedComment
    });
  } catch (err) {
    next(err);
  }
}

export const deleteComment = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed comment id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed comment id'] });
    }

    const deletedComment = await Comment.findOneAndDelete({ _id: req.params.id });

    if (!deletedComment) {
      logger.info(`resource not found - comment with id ${req.params.id} not found`);
      throw new ResponseError('Resource not found', 404);
    }

    logger.info(`delete comment success - comment deleted with id ${req.params.id}`);
    res.json({
      code: 200,
      message: 'Comment deleted successfully',
      data: deletedComment      
    });
  } catch (err) {
    next(err);
  }
}

export const likeComment = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed comment id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed comment id'] });
    }

    const commentToLike = await Comment.findById(req.params.id);

    if (!commentToLike) {
      logger.info(`resource not found - comment with id ${req.params.id} not found`);
      throw new ResponseError('Resource not found', 404);
    }

    if (!commentToLike.likes.includes(req.body.userId)) {
      commentToLike.likes.push(req.body.userId);
      commentToLike.numberOfLikes += 1;
      await commentToLike.save();
    }

    logger.info(`like comment success - comment liked with id ${req.params.id}`);
    res.json({
      code: 200,
      message: 'Comment liked successfully',
    });
  } catch (err) {
    next(err);
  }
}

export const unlikeComment = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed comment id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed comment id'] });
    }
    
    const commentToUnlike = await Comment.findById(req.params.id);

    if (!commentToUnlike) {
      logger.info(`resource not found - comment with id ${req.params.id} not found`);
      throw new ResponseError('Resource not found', 404);
    }

    if (commentToUnlike.likes.includes(req.body.userId)) {
      commentToUnlike.likes.filter(like => like.toString() !== req.body.userId);
      commentToUnlike.numberOfLikes -= 1;
      await commentToUnlike.save();
    }

    logger.info(`unlike comment success - comment unliked with id ${req.params.id}`);
    res.json({
      code: 200,
      message: 'Comment unliked successfully',
    });
  } catch (err) {
    next(err);
  }
}

