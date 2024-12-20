import Joi from 'joi';
import mongoose from 'mongoose';

const permissionSchema = Joi.object({
  action: Joi.string().valid('create', 'read', 'update', 'delete').required(),
  resource: Joi.string()
    .valid(
      'user',
      'role',
      'permission',
      'post',
      'comment',
      'category',
      'dashboard'
    )
    .required(),
});

export const getPermissionSchema = Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value))
      return helpers.message('permission id is invalid');
    return value;
  })
  .label('permissionId')
  .required();
export const createPermissionSchema = permissionSchema;
export const updatePermissionSchema = permissionSchema.fork(
  ['action', 'resource', 'description'],
  schema => schema.optional()
);
