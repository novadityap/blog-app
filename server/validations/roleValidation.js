import joi from 'joi';

const nameSchema = joi.string().valid('admin', 'user').required();

const baseRoleSchema = joi.object({
  name: nameSchema
});

export const createRoleSchema = baseRoleSchema;
export const updateRoleSchema = baseRoleSchema.fork(['name'], schema => schema.optional());
