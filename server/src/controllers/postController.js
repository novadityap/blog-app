import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import Category from '../models/categoryModel.js';
import slugify from 'slugify';
import ResponseError from '../utils/responseError.js';
import uploadFile from '../utils/uploadFile.js';
import validate from '../utils/validate.js';
import logger from '../utils/logger.js';
import {
  createPostSchema,
  updatePostSchema,
  getPostSchema,
  searchPostSchema,
} from '../validations/postValidation.js';
import mongoose from 'mongoose';
import { unlink } from 'node:fs/promises';
import path from 'node:path';

const create = async (req, res, next) => {
  try {
    const { files, fields } = await uploadFile(req, {
      fieldname: 'postImage',
      formSchema: createPostSchema,
    });

    fields.slug = slugify(fields.title, { lower: true });

    if (files) fields.postImage = files[0].newFilename;

    if (fields.category) {
      const category = await Category.exists({ _id: fields.category });
      if (!category) {
        logger.warn('validation errors');
        throw new ResponseError('Validation errors', 400, {
          category: 'Invalid category id',
        });
      }
    }

    await Post.create({ ...fields, userId: req.user.id });

    logger.info('post created successfully');
    res.status(201).json({
      code: 201,
      message: 'Post created successfully',
    });
  } catch (e) {
    next(e);
  }
};

const search = async (req, res, next) => {
  try {
    const query = validate(searchPostSchema, req.query);

    const { page, limit, search, category } = query;

    const [{ posts, totalPosts }] = await Post.aggregate()
      .lookup({
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
        pipeline: [{ $project: { username: 1, email: 1, avatar: 1 } }],
      })
      .lookup({
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      })
      .match({
        $and: [
          search
            ? {
                $or: [
                  { title: { $regex: search, $options: 'i' } },
                  { content: { $regex: search, $options: 'i' } },
                  { 'user.username': { $regex: search, $options: 'i' } },
                  { 'user.email': { $regex: search, $options: 'i' } },
                  { 'category.name': { $regex: search, $options: 'i' } },
                ],
              }
            : {},
          category
            ? { 'category._id': new mongoose.Types.ObjectId(category) }
            : {},
        ],
      })
      .addFields({
        user: { $arrayElemAt: ['$user', 0] },
        category: { $arrayElemAt: ['$category.name', 0] },
      })
      .project({ userId: 0, comments: 0, likes: 0 })
      .facet({
        posts: [
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ],
        totalPosts: [{ $count: 'count' }],
      })
      .project({
        posts: 1,
        totalPosts: {
          $ifNull: [{ $arrayElemAt: ['$totalPosts.count', 0] }, 0],
        },
      });

    if (posts.length === 0) {
      logger.info('no posts found');
      return res.json({
        code: 200,
        message: 'No posts found',
        data: [],
        meta: {
          pageSize: limit,
          totalItems: 0,
          currentPage: page,
          totalPages: 0,
          hasMore: false,
        },
      });
    }

    logger.info('posts retrieved successfully');
    res.json({
      code: 200,
      message: 'Posts retrieved successfully',
      data: posts,
      meta: {
        pageSize: req.queryOptions.limit,
        totalItems: totalPosts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        hasMore: page * limit < totalPosts,
      },
    });
  } catch (e) {
    next(e);
  }
};

const show = async (req, res, next) => {
  try {
    const postId = validate(getPostSchema, req.params.postId);

    const post = await Post.findById(postId)
      .populate('userId', 'username')
      .populate('category');
    if (!post) {
      logger.warn('post not found');
      throw new ResponseError('Post not found', 404);
    }

    logger.info('post retrieved successfully');
    res.json({
      code: 200,
      message: 'Post retrieved successfully',
      data: post,
    });
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const postId = validate(getPostSchema, req.params.postId);

    const post = await Post.findById(postId);
    if (!post) {
      logger.warn('post not found');
      throw new ResponseError('Post not found', 404);
    }

    const { files, fields } = await uploadFile(req, {
      fieldname: 'postImage',
      formSchema: updatePostSchema,
    });

    if (fields.category && fields.category !== post.category) {
      const category = await Category.exists({ _id: fields.category });
      if (!category) {
        logger.warn('validation errors');
        throw new ResponseError('Validation errors', 400, {
          category: 'Invalid category id',
        });
      }
    }

    if (files?.length > 0) {
      if (post.postImage !== 'default.jpg')
        await unlink(path.resolve(process.env.POST_DIR, post.postImage));

      post.postImage = files[0].newFilename;
      logger.info('post image updated successfully');
    }

    Object.assign(post, fields);
    await post.save();

    logger.info('post updated successfully');
    res.json({
      code: 200,
      message: 'Post updated successfully',
      data: post,
    });
  } catch (e) {
    next(e);
  }
};

const remove = async (req, res, next) => {
  try {
    const postId = validate(getPostSchema, req.params.postId);

    const post = await Post.findByIdAndDelete(postId);
    if (!post) {
      logger.warn('post not found');
      throw new ResponseError('Post not found', 404);
    }

    if (post.postImage !== 'default.jpg') {
      await unlink(path.resolve(process.env.POST_DIR, post.postImage));
      logger.info('post image deleted successfully');
    }

    logger.info('post deleted successfully');
    res.json({
      code: 200,
      message: 'Post deleted successfully',
    });
  } catch (e) {
    next(e);
  }
};

const like = async (req, res, next) => {
  try {
    const postId = validate(getPostSchema, req.params.postId);

    const post = await Post.findById(postId);
    if (!post) {
      logger.warn('post not found');
      throw new ResponseError('Post not found', 404);
    }

    const hasLiked = post.likes.includes(req.user.id);
    if (hasLiked) {
      post.likes.pop(req.user.id);
      post.totalLikes -= 1;
      await post.save();

      logger.info('post unliked successfully');
      return res.json({
        code: 200,
        message: 'Post unliked successfully',
      });
    }

    post.likes.push(req.user.id);
    post.totalLikes += 1;
    await post.save();

    logger.info('post liked successfully');
    return res.json({
      code: 200,
      message: 'Post liked successfully',
    });
  } catch (e) {
    next(e);
  }
};

export default { create, search, show, remove, update, like };
