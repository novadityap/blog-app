import Joi from 'joi';
import mongoose from 'mongoose';

const titleSchema = Joi.string().required();
const contentSchema = Joi.string().required();
const categorySchema = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) return helpers.error('invalid category id');
  return value;
}).required();

const basePostSchema = Joi.object({
  title: titleSchema,
  category: categorySchema,
  content: contentSchema,
});

export const createPostSchema = basePostSchema;
export const updatePostSchema = basePostSchema;