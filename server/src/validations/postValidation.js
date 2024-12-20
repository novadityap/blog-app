import Joi from 'joi';
import mongoose from 'mongoose';

const postSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  category: Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) return helpers.message('Invalid category id');
    return value;
  }).label('category').required()
});

export const searchPostSchema = Joi.object({
  page: Joi.number().integer().positive().min(1).default(1),
  limit: Joi.number().integer().positive().min(1).max(100).default(10),
  search: Joi.string().allow('').optional(),
  category: Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) return helpers.message('Invalid category id');
    return value;
  }).optional()
});

export const getPostSchema = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) return helpers.message('Invalid post id');
  return value;
}).label('postId').required();

export const createPostSchema = postSchema;
export const updatePostSchema = postSchema.fork(['title', 'content', 'category'], schema => schema.optional());