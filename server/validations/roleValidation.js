import joi from 'joi';
import mongoose from 'mongoose';

const nameSchema = joi.string().valid('admin', 'user').required();
// const permissionsSchema = joi.array().items(
//   joi.string().custom((value, helpers) => {
//     if (!mongoose.Types.ObjectId.isValid(value)) return helpers.error('invalid permission id');
//     return value;
//   })
// ).required();
const permissionsSchema = joi.array().items(joi.string()).required(); 

const baseRoleSchema = joi.object({
  name: nameSchema,
  permissions: permissionsSchema
});

export const createRoleSchema = baseRoleSchema;
export const updateRoleSchema = baseRoleSchema.fork(['name', 'permissions'], schema =>
  schema.optional()
);
