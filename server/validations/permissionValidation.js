import joi from 'joi';

const actionSchema = joi.string().valid('create', 'read', 'update', 'delete').required();
const resourceSchema = joi.string().valid('user', 'role', 'permission', 'post', 'comment').required();
const descriptionSchema = joi.string().required();

const basePermissionSchema = joi.object({
  action: actionSchema,
  resource: resourceSchema,
  description: descriptionSchema
});

export const createPermissionSchema = basePermissionSchema;
export const updatePermissionSchema = basePermissionSchema.fork(
  ['action', 'resource', 'description'],
  schema => schema.optional()
);