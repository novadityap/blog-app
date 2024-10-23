import Joi from 'joi';

const actionSchema = Joi.string().valid('create', 'read', 'update', 'delete').required();
const resourceSchema = Joi.string().valid('user', 'role', 'permission', 'post', 'comment', 'category', 'dashboard').required();
const descriptionSchema = Joi.string().required();

const basePermissionSchema = Joi.object({
  action: actionSchema,
  resource: resourceSchema,
  description: descriptionSchema
});

export const createPermissionSchema = basePermissionSchema;
export const updatePermissionSchema = basePermissionSchema.fork(
  ['action', 'resource', 'description'],
  schema => schema.optional()
);