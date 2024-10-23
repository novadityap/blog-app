import Permission from '../models/permissionModel.js';
import ResponseError from '../utils/responseError.js';
import logger from '../utils/logger.js';
import validateSchema from '../utils/validateSchema.js';
import {
  createPermissionSchema,
  updatePermissionSchema,
} from '../validations/permissionValidation.js';
import validateObjectId from '../utils/validateObjectId.js';

export const createPermission = async (req, res, next) => {
  try {
    const { validatedFields, validationErrors } = validateSchema(
      createPermissionSchema,
      req.body
    );

    if (validationErrors) {
      logger.info('create permission failed - invalid request fields');
      throw new ResponseError('Validation errors', 400, validationErrors);
    }

    const existingPermission = await Permission.findOne({
      action: validatedFields.action,
      resource: validatedFields.resource,
    });

    if (existingPermission) {
      logger.info(
        `create permission failed - permission already exists with action ${validatedFields.action} and resource ${validatedFields.resource}`
      );
      throw new ResponseError('Permission already exists', 409);
    }

    await Permission.create(validatedFields);

    logger.info(
      `create permission success - permission created with action ${validatedFields.action} and resource ${validatedFields.resource}`
    );
    res.json({
      code: 200,
      message: 'Permission created successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const getPermissions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0;
    const skip = (page - 1) * limit;
   
    const filter = req.query.search ? {
      $or: [
        { action: { $regex: req.query.search, $options: 'i' } },
        { resource: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ]
    } : {};  

    const totalPermissions = await Permission.countDocuments(filter);
    const totalPages = Math.ceil(totalPermissions / limit);

    const permissions = await Permission.find(filter)
      .skip(skip)
      .limit(limit);

    if (permissions.length === 0) {
      logger.info('resource not found - no permissions found in database');
      return res.json({
        code: 200,
        message: 'No permissions found',
        data: [],
      });
    }

    logger.info(`fetch all permissions success - ${permissions.length} permissions found`);
    res.json({
      code: 200,
      message: 'Permissions found',
      data: permissions,
      meta: {
        pageSize: limit,
        totalItems: totalPermissions,
        currentPage: page,
        totalPages,
      }
    });
  } catch (err) {
    next(err);
  }
}

export const getPermissionById = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed permission id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed permission id'] });
    }

    const permission = await Permission.findById(req.params.id);

    if (!permission) {
      logger.info(
        `resource not found - permission not found with id ${req.params.id}`
      );
      throw new ResponseError('Permission not found', 404);
    }

    logger.info(`fetch permission success - permission found with id ${req.params.id}`);
    res.json({
      code: 200,
      message: 'Permission found',
      data: permission,
    });
  } catch (err) {
    next(err);
  }
}

export const updatePermission = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed permission id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed permission id'] });
    }

    const { validatedFields, validationErrors } = validateSchema(
      updatePermissionSchema,
      req.body
    );

    if (validationErrors) {
      logger.info('update permission failed - invalid request fields');
      throw new ResponseError('Validation errors', 400, validationErrors);
    }

    const existingPermission = await Permission.findById(req.params.id);

    if (!existingPermission) {
      logger.info(
        `update permission failed - permission not found with id ${req.params.id}`
      );
      throw new ResponseError('Permission not found', 404);
    }

    const duplicatePermission = await Permission.findOne({
      _id: { $ne: req.params.id },
      action: validatedFields.action,
      resource: validatedFields.resource,
    });

    if (duplicatePermission) {
      logger.info(
        `update permission failed - permission already exists with action ${validatedFields.action} and resource ${validatedFields.resource}`
      );
      throw new ResponseError('Permission already in use', 409);
    }

    Object.assign(existingPermission, validatedFields);
    await existingPermission.save();

    logger.info(
      `update permission success - permission updated with action ${validatedFields.action} and resource ${validatedFields.resource}`
    );
    res.json({
      code: 200,
      message: 'Permission updated successfully',
      data: existingPermission
    });
  } catch (err) {
    next(err);
  }
}

export const deletePermission = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed permission id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed permission id'] });
    }

    const deletedPermission = await Permission.findByIdAndDelete(req.params.id);

    if (!deletedPermission) {
      logger.info(
        `delete permission failed - permission not found with id ${req.params.id}`
      );
      throw new ResponseError('Permission not found', 404);
    }

    logger.info(`delete permission success - permission deleted with id ${req.params.id}`);
    res.json({
      code: 200,
      message: 'Permission deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}
