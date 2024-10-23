import Role from "../models/roleModel.js";
import Permission from "../models/permissionModel.js";
import ResponseError from "../utils/responseError.js";
import logger from "../utils/logger.js";
import validateSchema from "../utils/validateSchema.js";
import {
  createRoleSchema,
  updateRoleSchema
} from "../validations/roleValidation.js";
import validateObjectId from "../utils/validateObjectId.js";

export const createRole = async (req, res, next) => {
  try {
    const { validatedFields, validationErrors } = validateSchema(createRoleSchema, req.body);

    if (validationErrors) {
      logger.info('create role failed - invalid request fields');
      throw new ResponseError('Validation error', 400, validationErrors);
    }

    const existingRole = await Role.findOne({ name: validatedFields.name });

    if (existingRole) {
      logger.info(`create role failed - role already exists with name ${validatedFields.name}`);
      throw new ResponseError('Role with that name already exists', 409, { name: ['Role with that name already exists'] });
    }

    const permissions = await Permission.find({ _id: { $in: validatedFields.permissions } });

    if (permissions.length !== validatedFields.permissions.length) {
      logger.info(`create role failed - some of the permissions is invalid`);
      throw new ResponseError('Validation errors', 400, { permissions: ['Some of the permissions is invalid'] });
    }

    await Role.create(validatedFields);

    logger.info(`create role success - role created with name ${validatedFields.name}`);
    res.json({
      code: 200,
      message: 'Role created successfully'
    });
  } catch (err) {
    next(err);
  }
}

export const getRoles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0;
    const skip = (page - 1) * limit;

    const filter = req.query.search ? { 
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
      ]
    } : {};

    const totalRoles = await Role.countDocuments(filter);
    const totalPages = Math.ceil(totalRoles / limit);

    const roles = await Role.find(filter)
      .skip(skip)
      .limit(limit);

    if (roles.length === 0) {
      logger.info('resource not found - no roles found in database');
      return res.json({
        code: 200,
        message: 'No roles found',
        data: [],
      });
    }

    logger.info(`fetch all roles success - ${roles.length} roles found`);
    res.json({
      code: 200,
      message: 'Roles found',
      data: roles,
      meta: {
        pageSize: limit,
        totalItems: totalRoles,
        currentPage: page,
        totalPages
      }
    });
  } catch (err) {
    next(err);
  }
}

export const getRoleById = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed role id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed role id'] });
    }

    const role = await Role.findById(req.params.id).populate('permissions', 'id');

    if (!role) {
      logger.info(`resource not found - role not found with id ${req.params.id}`);
      throw new ResponseError('Role not found', 404);
    }

    logger.info(`fetch role success - role found with id ${req.params.id}`);
    res.json({
      code: 200,
      message: 'Role found',
      data: role
    });
  } catch (err) {
    next(err);
  }
}

export const updateRole = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed role id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed role id'] });
    }

    const { validatedFields, validationErrors } = validateSchema(updateRoleSchema, req.body);

    if (validationErrors) {
      logger.info('update role failed - invalid request fields');
      throw new ResponseError('Validation errors', 400, validationErrors);
    }

    const roleToUpdate = await Role.findById(req.params.id);

    if (!roleToUpdate) {
      logger.info(`update role failed - role not found with id ${req.params.id}`);
      throw new ResponseError('Role not found', 404);
    }

    const permissions = await Permission.find({ _id: { $in: validatedFields.permissions } });

    if (permissions.length !== validatedFields.permissions.length) {
      logger.info(`update role failed - some of the permissions is invalid`);
      throw new ResponseError('Validation errors', 400, { permissions: ['Some of the permissions is invalid'] });
    }

    if (validatedFields?.name) {
      const existingRoleName = await Role.findOne({ 
        name: validatedFields.name,
        _id: { $ne: req.params.id }
      });

      if (existingRoleName) {
        logger.info(`update role failed - role already exists with name ${validatedFields.name}`);
        throw new ResponseError('Role with that name already exists', 409);
      }

      roleToUpdate.name = validatedFields.name;
    }

    if (validatedFields?.permissions) {
      roleToUpdate.permissions = validatedFields.permissions;
    }

    await roleToUpdate.save();

    logger.info(`update role success - role updated with id ${req.params.id}`);
    res.json({
      code: 200,
      message: 'Role updated successfully',
      data: roleToUpdate
    });
  } catch (err) {
    next(err);
  }
}

export const deleteRole = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed role id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed role id'] });
    }

    const deletedRole = await Role.findByIdAndDelete(req.params.id);

    if (!deletedRole) {
      logger.info(`delete role failed - role not found with id ${req.params.id}`);
      throw new ResponseError('Role not found', 404);
    }

    logger.info(`delete role success - role deleted with id ${req.params.id}`);
    res.json({
      code: 200,
      message: 'Role deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}
