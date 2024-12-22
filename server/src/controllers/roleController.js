import Role from '../models/roleModel.js';
import Permission from '../models/permissionModel.js';
import ResponseError from '../utils/responseError.js';
import logger from '../utils/logger.js';
import validate from '../utils/validate.js';
import {
  createRoleSchema,
  updateRoleSchema,
  getRoleSchema,
  searchRoleSchema,
} from '../validations/roleValidation.js';

const create = async (req, res, next) => {
  try {
    const fields = validate(createRoleSchema, req.body);

    const isNameTaken = await Role.exists({ name: fields.name });
    if (isNameTaken) {
      logger.warn('resource already in use');
      throw new ResponseError('Resource already in use', 409, {
        name: 'Name already in use',
      });
    }

    if (fields.permissions?.length > 0) {
      const totalPermissions = await Permission.countDocuments({
        _id: { $in: fields.permissions },
      });

      if (totalPermissions !== fields.permissions.length) {
        logger.warn('validation errors');
        throw new ResponseError('Validation errors', 400, {
          permissions: 'Invalid permission id',
        });
      }
    }

    await Role.create(fields);

    logger.info('role created successfully');
    res.status(201).json({
      code: 201,
      message: 'Role created successfully',
    });
  } catch (e) {
    next(e);
  }
};

const search = async (req, res, next) => {
  try {
    const query = validate(searchRoleSchema, req.query);
    const { page, limit, search } = query;

    const [{ roles, totalRoles }] = await Role.aggregate()
      .lookup({
        from: 'permissions',
        localField: 'permissions',
        foreignField: '_id',
        as: 'permissions',
      })
      .unwind({ path: '$permissions', preserveNullAndEmptyArrays: true })
      .group({
        _id: '$_id',
        name: { $first: '$name' },
        permissions: { $push: '$permissions.name' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
      })
      .addFields({
        permissions: {
          $map: {
            input: '$permissions',
            as: 'permission',
            in: {
              $replaceAll: {
                input: '$$permission',
                find: '_',
                replacement: ' ',
              },
            },
          },
        },
      })
      .match(
        search
          ? {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { 'permissions.name': { $regex: search, $options: 'i' } },
              ],
            }
          : {}
      )
      .facet({
        roles: [
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ],
        totalRoles: [{ $count: 'count' }],
      })
      .project({
        roles: 1,
        totalRoles: {
          $ifNull: [{ $arrayElemAt: ['$totalRoles.count', 0] }, 0],
        },
      });

    if (roles.length === 0) {
      logger.info('no roles found');
      return res.json({
        code: 200,
        message: 'No roles found',
        data: [],
        meta: {
          pageSize: limit,
          totalItems: 0,
          currentPage: page,
          totalPages: 0,
        },
      });
    }

    logger.info('roles retrieved successfully');
    res.json({
      code: 200,
      message: 'Roles retrieved successfully',
      data: roles,
      meta: {
        pageSize: limit,
        totalItems: totalRoles,
        currentPage: page,
        totalPages: Math.ceil(totalRoles / limit),
      },
    });
  } catch (e) {
    next(e);
  }
};

const list = async (req, res, next) => {
  try {
    const roles = await Role.find();
    if (roles.length === 0) {
      logger.info('no roles found');
      return res.json({
        code: 200,
        message: 'No roles found',
        data: [],
      });
    }

    logger.info('roles retrieved successfully');
    res.json({
      code: 200,
      message: 'Roles retrieved successfully',
      data: roles,
    });
  } catch (e) {
    next(e);
  }
};


const show = async (req, res, next) => {
  try {
    const roleId = validate(getRoleSchema, req.params.roleId);

    const role = await Role.findById(roleId).populate({
      path: 'permissions',
      select: '_id',
      transform: doc => doc._id,
    });

    if (!role) {
      logger.warn('role not found');
      throw new ResponseError('Role not found', 404);
    }

    logger.info('role retrieved successfully');
    res.json({
      code: 200,
      message: 'Role retrieved successfully',
      data: role,
    });
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const roleId = validate(getRoleSchema, req.params.roleId);
    const fields = validate(updateRoleSchema, req.body);

    const role = await Role.findById(roleId).populate({
      path: 'permissions',
      select: '_id',
      transform: doc => doc._id,
    });

    if (!role) {
      logger.warn('role not found');
      throw new ResponseError('Role not found', 404);
    }

    if (fields.name && fields.name !== role.name) {
      const isNameTaken = await Role.exists({
        name: fields.name,
        _id: { $ne: roleId },
      });

      if (isNameTaken) {
        logger.warn('resource already in use');
        throw new ResponseError('Resource already in use', 409, {
          name: 'Name already in use',
        });
      }
    }

    if (fields.permissions?.length > 0) {
      const totalPermissions = await Permission.countDocuments({
        _id: { $in: fields.permissions },
      });

      if (totalPermissions !== fields.permissions.length) {
        logger.warn('validation errors');
        throw new ResponseError('Validation errors', 400, {
          permissions: 'Invalid permission id',
        });
      }
    }

    Object.assign(role, fields);
    await role.save();

    logger.info('role updated successfully');
    res.json({
      code: 200,
      message: 'Role updated successfully',
      data: role,
    });
  } catch (e) {
    next(e);
  }
};

const remove = async (req, res, next) => {
  try {
    const roleId = validate(getRoleSchema, req.params.roleId);

    const role = await Role.findByIdAndDelete(roleId);
    if (!role) {
      logger.warn('role not found');
      throw new ResponseError('Role not found', 404);
    }

    logger.info('role deleted successfully');
    res.json({
      code: 200,
      message: 'Role deleted successfully',
    });
  } catch (e) {
    next(e);
  }
};

export default { create, search, show, update, remove, list };
