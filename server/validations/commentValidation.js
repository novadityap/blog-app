import joi from 'joi';
import mongoose from 'mongoose';

const contentSchema = joi.string().required();
const userIdSchema = joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) return helpers.error('invalid user id');
  return value;
}).required();

const baseCommentSchema = joi.object({
  content: contentSchema,
  userId: userIdSchema
});

export const createCommentSchema = baseCommentSchema;

export const updateCommentSchema = baseCommentSchema.fork(['content'], schema => schema.optional());