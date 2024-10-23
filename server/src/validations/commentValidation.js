import Joi from 'joi';
import mongoose from 'mongoose';

const contentSchema = Joi.string().required();
const userIdSchema = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) return helpers.error('invalid user id');
  return value;
}).required();

const baseCommentSchema = Joi.object({
  content: contentSchema,
  userId: userIdSchema
});

export const createCommentSchema = baseCommentSchema;

export const updateCommentSchema = baseCommentSchema.fork(['content'], schema => schema.optional());