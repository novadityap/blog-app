import Post from '../models/postModel.js';
import slugify from 'slugify';
import ResponseError from '../utils/responseError.js';
import uploadAndValidate from '../utils/uploadAndValidate.js';
import logger from '../utils/logger.js';
import {
  createPostSchema,
  updatePostSchema,
} from '../validations/postValidation.js';
import * as fs from 'node:fs/promises';
import validateObjectId from '../utils/validateObjectId.js';
import path from 'node:path';

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
    const limit = parseInt(req.query.limit) || 0;
    const skip = (page - 1) * limit;

    let filter = {};

    if (req.query.search) {
      filter = {
        ...filter,
        $or: [
          { title: { $regex: req.query.search, $options: 'i' } },
          { content: { $regex: req.query.search, $options: 'i' } },
        ],
      };
    }

    if (req.query.category) {
      filter = {
        ...filter,
        category: req.query.category, 
      };
    }

    const totalPosts = await Post.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / limit);
    const hasMore = page * limit < totalPosts;

    const posts = await Post.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('userId', 'username email avatar')
      .populate('category');

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

    const post = await Post.findById(req.params.id)
      .populate('userId', 'email')
      .populate({
        path: 'comments',
        populate: {
          path: 'userId',
          select: 'username'
        }
      })
      .populate('category');

    if (!post) {
      logger.info(`resource not found - post not found with id ${req.params.id}`);
      throw new ResponseError('Post not found', 404);
    }

    logger.info(`fetch post success - post found with id ${req.params.id}`);
    res.json({
      code: 200,
      message: 'Post found',  
      data: post
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

    if (validatedFiles) {
      if (existingPost.postImage !== 'default.jpg') {
        await fs.unlink(
          path.join(process.cwd(), process.env.POST_UPLOADS_DIR, existingPost.postImage)
        );
      }

      existingPost.postImage = validatedFiles[0].newFilename;
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

    await postToDelete.deleteOne();

    logger.info(`delete post success - post deleted with id ${req.params.id}`);
    res.json({
      code: 200,
      message: 'Post deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}




