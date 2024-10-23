import Joi from 'joi';

const nameSchema = Joi.string().required();

const baseCategorySchema = Joi.object({
  name: nameSchema
});

export const createCategorySchema = baseCategorySchema;
export const updateCategorySchema = baseCategorySchema.fork(['name'], schema => schema.optional())