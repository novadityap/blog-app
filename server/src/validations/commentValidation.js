import Joi from 'joi';
import mongoose from 'mongoose';

const commentSchema = Joi.object({
  text: Joi.string().required(),
});

export const searchCommentSchema = Joi.object({
  page: Joi.number().integer().positive().min(1).default(1),
  limit: Joi.number().integer().positive().min(1).max(100).default(10),
  search: Joi.string().allow('').optional(),
});
export const getCommentSchema = Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value))
      return helpers.message('Comment id is invalid');
    return value;
  })
  .label('commentId')
  .required();
export const createCommentSchema = commentSchema;
export const updateCommentSchema = commentSchema.fork(['text'], schema =>
  schema.optional()
);
