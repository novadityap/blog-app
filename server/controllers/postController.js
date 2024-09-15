import Post from '../models/postModel.js';
import slugify from 'slugify';
import ResponseError from '../utils/responseError.js';
import validateMultipart from '../utils/validateMultipart.js';
import logger from '../utils/logger.js';
import { createPostSchema } from '../validations/postValidation.js';
export const createPost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { validatedFiles, validationErrors, validatedData } =
      await validateMultipart.single(req, createPostSchema, 'postImage');

    if (validationErrors) {
      logger.info('validation error');
      throw new ResponseError('Validation error', 400, validationErrors);
    }

    validatedData.slug = slugify(validatedData.title, { lower: true });

    if (validatedFiles.postImage) {
      const postImageFilename = validatedFiles.postImage[0].newFilename;
      validatedData.postImage = postImageFilename;
    }

    await Post.create({
      ...validatedData,
      userId,
    });

    res.json({
      code: 200,
      message: 'Post created successfully',
    });
  } catch (err) {
    next(err);
  }
};
