import joi from 'joi';

const titleSchema = joi.string().required();
const contentSchema = joi.string().required();

const basePostSchema = joi.object({
  title: titleSchema,
  content: contentSchema,
});

export const createPostSchema = basePostSchema;

export const updatePostSchema = basePostSchema.fork(
  ['title', 'content'],
  schema => schema.optional()
)