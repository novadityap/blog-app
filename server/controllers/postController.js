import Post from '../models/postModel.js';
import Comment from '../models/commentModel.js';
import slugify from 'slugify';
import ResponseError from '../utils/responseError.js';
import uploadAndValidate from '../utils/uploadAndValidate.js';
import logger from '../utils/logger.js';
import {
  createPostSchema,
  updatePostSchema,
} from '../validations/postValidation.js';
import {
  createCommentSchema,
} from '../validations/commentValidation.js';
import * as fs from 'node:fs/promises';
import validateObjectId from '../utils/validateObjectId.js';

export const createPost = async (req, res, next) => {
  try {
    const { validatedFiles, validatedFields, validationErrors } = await uploadAndValidate(
      req,
      { fieldname: 'postImage' },
      createPostSchema
    )

    if (validationErrors) {
      logger.info('create post failed - invalid request fields');
      throw new ResponseError('Validation errors', 400, validationErrors);
    }

    validatedFields.slug = slugify(validatedFields.title, { lower: true });

    if (validatedFiles?.postImage) {
      validatedFields.postImage = validatedFiles.postImage[0].newFilename;
    }

    await Post.create({
      ...validatedFields,
      userId: req.user.id,
    });

    res.json({
      code: 200,
      message: 'Post created successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);
    const hasMore = page * limit < totalPosts;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      
      filter.$or = [
        { title: searchRegex },
        { content: searchRegex },
      ];
    }

    let sortOrder = -1;
    if (req.query.sortBy === 'oldest') sortOrder = 1;

    const posts = await Post.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: sortOrder })
      .populate('userId', 'username email');

    if (posts.length === 0) {
      logger.info('resource not found - no posts found in database');
      return res.json({
        code: 200,
        message: 'No posts found',
        data: [],
      });
    }

    logger.info(`fetch all posts success - ${posts.length} posts found`);
    res.json({
      code: 200,
      message: 'Posts found',
      data: posts,
      meta: {
        pageSize: limit,
        totalItems: totalPosts,
        currentPage: page,
        totalPages,
        hasMore
      }
    });
  } catch (err) {
    next(err);
  }
}

export const getPostById = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed post id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed post id'] });
    }

    const post = await Post.findById(req.params.id).populate('userId').populate('comments');

    if (!post) {
      logger.info(`resource not found - post not found with id ${req.params.id}`);
      throw new ResponseError('Post not found', 404);
    }

    logger.info(`fetch post success - post found with id ${req.params.id}`);
    res.json({
      code: 200,
      message: 'Post found',
      data: post,
    });
  } catch (err) {
    next(err);
  }
}

export const updatePost = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed post id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed post id'] });
    }

    const { validatedFiles, validatedFields, validationErrors } = await uploadAndValidate(
      req,
      { fieldname: 'postImage' },
      updatePostSchema
    );

    if (validationErrors) {
      logger.info('update post failed - invalid request fields');
      throw new ResponseError('Validation errors', 400, validationErrors);
    }

    const existingPost = await Post.findById(req.params.id);

    if (!existingPost) {
      logger.info(`update post failed - post not found with id ${req.params.id}`);
      throw new ResponseError('Post not found', 404);
    }

    if (validatedFields?.postImage) {
      if (existingPost.postImage !== 'default.jpg') {
        await fs.unlink(
          path.join(process.cwd(), process.env.POST_UPLOADS_DIR, existingPost.postImage)
        );
      }

      existingPost.postImage = validatedFiles.postImage[0].newFilename;
    }

    Object.assign(existingPost, validatedFields);
    await existingPost.save();
    
    logger.info(`update post success - post updated with id ${req.params.id}`);
    res.json({
      code: 200,
      message: 'Post updated successfully',
      data: existingPost
    });
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed post id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed post id'] });
    }

    const postToDelete = await Post.findById(req.params.id);

    if (!postToDelete) {
      logger.info(`delete post failed - post not found with id ${req.params.id}`);
      throw new ResponseError('Post not found', 404);
    }

    if (postToDelete.postImage !== 'default.jpg') {
      await fs.unlink(
        path.join(process.cwd(), process.env.POST_UPLOADS_DIR, postToDelete.postImage)
      );
    }

    await postToDelete.remove();

    logger.info(`delete post success - post deleted with id ${req.params.id}`);
    res.json({
      code: 200,
      message: 'Post deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

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

export const getCommentsByPost = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed post id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed post id'] });
    }
    
    const comments = await Comment.find({ postId: req.params.id });

    if (comments.length === 0) {
      logger.info('resource not found - no comments found in database');
      return res.json({
        code: 200,
        message: 'No comments found',
        data: [],
      });
    }

    logger.info(`fetch all comments success - ${comments.length} comments found`);
    res.json({
      code: 200,
      message: 'Comments found',
      data: comments
    });
  } catch (err) {
    next(err);
  }
}
