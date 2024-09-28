import Joi from 'joi';

const titleSchema = Joi.string().required();
const contentSchema = Joi.string().required();

const basePostSchema = Joi.object({
  title: titleSchema,
  content: contentSchema,
});

export const createPostSchema = basePostSchema;

export const updatePostSchema = basePostSchema.fork(
  ['title', 'content'],
  schema => schema.optional()
)