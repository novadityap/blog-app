import Joi from 'joi';
import mongoose from 'mongoose';

const nameSchema = Joi.string().valid('admin', 'user').required();
// const permissionsSchema = Joi.array().items(
//   Joi.string().custom((value, helpers) => {
//     if (!mongoose.Types.ObjectId.isValid(value)) return helpers.error('invalid permission id');
//     return value;
//   })
// ).required();
const permissionsSchema = Joi.array().items(Joi.string()).required(); 

const baseRoleSchema = Joi.object({
  name: nameSchema,
  permissions: permissionsSchema
});

export const createRoleSchema = baseRoleSchema;
export const updateRoleSchema = baseRoleSchema.fork(['name', 'permissions'], schema =>
  schema.optional()
);
