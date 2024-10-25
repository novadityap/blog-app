import Post from '../models/postModel.js';
import Category from '../models/categoryModel.js';
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

const create = async request => {
  const { validatedFiles, validatedFields, validationErrors } =
    await uploadAndValidate(request, {
      fieldname: 'postImage',
      formSchema: createPostSchema,
    });

  if (validationErrors) {
    logger.warn('create post - invalid request fields');
    throw new ResponseError('Validation errors', 400, validationErrors);
  }

  const category = await Category.findById(validatedFields.category);
  if (!category) {
    logger.warn(
      `create post - category with id ${validatedFields.category} is not found`
    );
    throw new ResponseError('Category not found', 404);
  }

  validatedFields.slug = slugify(validatedFields.title, { lower: true });

  if (validatedFiles) {
    validatedFields.postImage = validatedFiles[0].newFilename;
  }

  await Post.create({
    ...validatedFields,
    userId: request.user.id,
  });

  logger.info('create post - post created successfully');
};

const update = async (id, request) => {
  if (!validateObjectId(id)) {
    logger.warn(`update post - invalid or malformed post id ${id}`);
    throw new ResponseError('Invalid post id', 400, {
      id: ['Invalid or malformed post id'],
    });
  }

  const post = await Post.findById(id);
  if (!post) {
    logger.warn(`update post failed - post not found with id ${id}`);
    throw new ResponseError('Post not found', 404);
  }

  const { validatedFiles, validatedFields, validationErrors } =
    await uploadAndValidate(request, {
      fieldname: 'postImage',
      formSchema: updatePostSchema,
    });

  if (validationErrors) {
    logger.warn('update post - invalid request fields');
    throw new ResponseError('Validation errors', 400, validationErrors);
  }

  const category = await Category.findById(validatedFields.category);
  if (!category) {
    logger.warn(
      `update post - category with id ${validatedFields.category} is not found`
    );
    throw new ResponseError('Category not found', 404);
  }

  if (validatedFiles) {
    if (post.postImage !== 'default.jpg') {
      await fs.unlink(
        path.join(process.cwd(), process.env.POST_UPLOADS_DIR, post.postImage)
      );
    }

    post.postImage = validatedFiles[0].newFilename;
    logger.info(
      `update post - image from post id ${post._id} successfully updated`
    );
  }

  Object.assign(post, validatedFields);
  await post.save();

  logger.info(`update post - post updated with id ${id}`);
  return post;
};

const getById = async id => {
  if (!validateObjectId(id)) {
    logger.warn(`fetch post - invalid or malformed post id ${id}`);
    throw new ResponseError('Invalid post id', 400, {
      id: ['Invalid or malformed post id'],
    });
  }

  const post = await Post.findById(id)
    .populate('userId', 'email')
    .populate({
      path: 'comments',
      populate: {
        path: 'userId',
        select: 'username',
      },
    })
    .populate('category');

  if (!post) {
    logger.warn(`fetch post - post not found with id ${id}`);
    throw new ResponseError('Post not found', 404);
  }

  logger.info(`fetch post - post found with id ${id}`);
  return post;
};

const getAll = async options => {
  const { page, limit, search, filters, skip } = options;
  const filter = { ...filters };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
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
    logger.warn('fetch posts - no posts found in database');
  } else {
    logger.info(`fetch posts - ${posts.length} posts found`);
  }

  return {
    posts,
    totalPosts,
    totalPages,
    hasMore,
  };
};

const remove = async id => {
  if (!validateObjectId(id)) {
    logger.warn(`delete post - invalid or malformed post id ${id}`);
    throw new ResponseError('Invalid post id', 400, {
      id: ['Invalid or malformed post id'],
    });
  }

  const post = await Post.findById(id);
  if (!post) {
    logger.warn(`delete post - post not found with id ${id}`);
    throw new ResponseError('Post not found', 404);
  }

  if (post.postImage !== 'default.jpg') {
    await fs.unlink(
      path.join(process.cwd(), process.env.POST_UPLOADS_DIR, post.postImage)
    );
    logger.info(
      `delete post - image from post id ${post._id} successfully deleted`
    );
  }

  await post.deleteOne();
  logger.info(`delete post - post successfully deleted with id ${id}`);
};

export default {
  create,
  update,
  getById,
  getAll,
  remove,
};
