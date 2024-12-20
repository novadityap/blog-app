import {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  searchUserSchema,
} from '../validations/userValidation.js';
import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import validate from '../utils/validate.js';
import uploadFile from '../utils/uploadFile.js';
import ResponseError from '../utils/responseError.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcrypt';
import path from 'path';
import { unlink } from 'node:fs/promises';
import checkOwnership from '../utils/checkOwnership.js';

const show = async (req, res, next) => {
  try {
    const userId = validate(getUserSchema, req.params.userId);
    const currentUser = req.user;

    await checkOwnership(User, userId, currentUser);

    const user = await User.findById(userId).populate({
      path: 'roles',
      select: '_id',
      transform: doc => doc._id,
    });
    if (!user) {
      logger.warn('user not found');
      throw new ResponseError('User not found', 404);
    }

    logger.info('user retrieved successfully');
    res.json({
      code: 200,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (e) {
    next(e);
  }
};

const search = async (req, res, next) => {
  try {
    const query = validate(searchUserSchema, req.query);

    const { page, limit, search } = query;

    const [{ users, totalUsers }] = await User.aggregate()
      .lookup({
        from: 'roles',
        localField: 'roles',
        foreignField: '_id',
        as: 'roles',
        pipeline: [{ $project: { name: 1 } }],
      })
      .addFields({
        roles: { $map: { input: '$roles', as: 'role', in: '$$role.name' } },
      })
      .project({ password: 0 })
      .match(
        search
          ? {
              $or: [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { 'roles.name': { $regex: search, $options: 'i' } },
              ],
            }
          : {}
      )
      .facet({
        users: [
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ],
        totalUsers: [{ $count: 'count' }],
      })
      .project({
        users: 1,
        totalUsers: {
          $ifNull: [{ $arrayElemAt: ['$totalUsers.count', 0] }, 0],
        },
      });

    if (users.length === 0) {
      logger.info('no users found');
      return res.json({
        code: 200,
        message: 'No users found',
        data: [],
        meta: {
          pageSize: limit,
          totalItems: 0,
          currentPage: page,
          totalPages: 0,
        },
      });
    }

    logger.info('users retrieved successfully');
    res.json({
      code: 200,
      message: 'Users retrieved successfully',
      data: users,
      meta: {
        pageSize: limit,
        totalItems: totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (e) {
    next(e);
  }
};

const create = async (req, res, next) => {
  try {
    const fields = validate(createUserSchema, req.body);

    const user = await User.findOne({
      $or: [{ username: fields.username }, { email: fields.email }],
    });

    if (user) {
      const field = user.username === fields.username ? 'username' : 'email';
      const capitalizedField = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      }`;

      logger.warn('resource already in use');
      throw new ResponseError('Resource already in use', 409, {
        [field]: `${capitalizedField} already in use`,
      });
    }

    const totalRoles = await Role.countDocuments({
      _id: { $in: fields.roles },
    });
    if (totalRoles !== fields.roles.length) {
      logger.warn('validation errors');
      throw new ResponseError('Validation errors', 400, {
        roles: 'Invalid role id',
      });
    }

    fields.password = await bcrypt.hash(fields.password, 10);

    await User.create({
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
      ...fields,
    });

    logger.info('user created successfully');
    res.status(201).json({
      code: 201,
      message: 'User created successfully',
    });
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const userId = validate(getUserSchema, req.params.userId);
    const currentUser = req.user;

    await checkOwnership(User, userId, currentUser);

    const user = await User.findById(userId);
    if (!user) {
      logger.warn('user not found');
      throw new ResponseError('User not found', 404);
    }

    const { files, fields } = await uploadFile(req, {
      fieldname: 'avatar',
      formSchema: updateUserSchema,
    });

    if (fields.username && fields.username !== user.username) {
      const isUsernameTaken = await User.exists({
        username: fields.username,
        _id: { $ne: userId },
      });

      if (isUsernameTaken) {
        logger.warn('resource already in use');
        throw new ResponseError('Resource already in use', 409, {
          username: 'Username already in use',
        });
      }
    }

    if (fields.email && fields.email !== user.email) {
      const isEmailTaken = await User.exists({
        email: fields.email,
        _id: { $ne: userId },
      });

      if (isEmailTaken) {
        logger.warn('resource already in use');
        throw new ResponseError('Resource already in use', 409, {
          email: 'Email already in use',
        });
      }
    }

    if (fields.roles?.length > 0) {
      const totalRoles = await Role.countDocuments({
        _id: { $in: fields.roles },
      });
      if (totalRoles !== fields.roles.length) {
        logger.warn('validation errors');
        throw new ResponseError('Validation errors', 400, {
          roles: 'Invalid role id',
        });
      }
    }

    if (fields.password)
      fields.password = await bcrypt.hash(fields.password, 10);

    if (files?.length > 0) {
      if (user.avatar !== 'default.jpg')
        await unlink(path.resolve(process.env.AVATAR_DIR, user.avatar));

      user.avatar = files[0].newFilename;
      logger.info('avatar updated successfully');
    }

    Object.assign(user, fields);
    await user.save();

    logger.info('user updated successfully');
    res.json({
      code: 200,
      message: 'User updated successfully',
      data: user,
    });
  } catch (e) {
    next(e);
  }
};

const remove = async (req, res, next) => {
  try {
    const userId = validate(getUserSchema, req.params.userId);
    const currentUser = req.user;

    await checkOwnership(User, userId, currentUser);

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      logger.warn('user not found');
      throw new ResponseError('User not found', 404);
    }

    if (user.avatar !== 'default.jpg') {
      await unlink(path.resolve(process.env.AVATAR_DIR, user.avatar));
      logger.info('avatar deleted successfully');
    }

    logger.info('user deleted successfully');
    res.json({
      code: 200,
      message: 'User deleted successfully',
    });
  } catch (e) {
    next(e);
  }
};

export default { show, search, create, update, remove };
