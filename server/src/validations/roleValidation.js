import Joi from 'joi';
import mongoose from 'mongoose';

const roleSchema = Joi.object({
  name: Joi.string().required(),
  permissions: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value))
          return helpers.message('Invalid permission id');
        return value;
      })
    )
    .min(1)
    .label('permissions')
    .required(),
});

export const searchRoleSchema = Joi.object({
  page: Joi.number().integer().positive().min(1).default(1),
  limit: Joi.number().integer().positive().min(1).max(100).default(10),
  search: Joi.string().allow('').optional(),
});
export const getRoleSchema = Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value))
      return helpers.message('Role id is invalid');
    return value;
  })
  .label('roleId')
  .required();
export const createRoleSchema = roleSchema;
export const updateRoleSchema = roleSchema.fork(
  ['name', 'permissions'],
  schema => schema.optional()
);
