import {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  searchUserSchema,
  updateProfileSchema
} from '../validations/userValidation.js';
import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import validate from '../utils/validate.js';
import uploadFile from '../utils/uploadFile.js';
import ResponseError from '../utils/responseError.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcrypt';
import checkOwnership from '../utils/checkOwnership.js';
import cloudinary from '../utils/cloudinary.js';
import extractPublicId from '../utils/extractPublicId.js';

const show = async (req, res, next) => {
  try {
    const userId = validate(getUserSchema, req.params.userId);
    await checkOwnership(User, userId, req.user);

    const user = await User.findById(userId).populate('role');
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

const updateProfile = async (req, res, next) => {
  try {
    const userId = validate(getUserSchema, req.params.userId);
    await checkOwnership(User, userId, req.user);

    const user = await User.findById(userId)
      .populate('role', 'name');
      
    if (!user) {
      logger.warn('user not found');
      throw new ResponseError('User not found', 404);
    }

    const { file, fields } = await uploadFile(req, {
      fieldname: 'avatar',
      formSchema: updateProfileSchema,
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

    if (fields.password)
      fields.password = await bcrypt.hash(fields.password, 10);

    if (file) {
      if (user.avatar !== process.env.DEFAULT_AVATAR_URL) await cloudinary.uploader.destroy(extractPublicId(user.avatar));

      user.avatar = file.secure_url;
      logger.info('avatar updated successfully');
    }

    Object.assign(user, fields);
    await user.save();

    logger.info('profile updated successfully');
    res.json({
      code: 200,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role.name,
      },
    });
  } catch (e) {
    next(e);
  }
}

const search = async (req, res, next) => {
  try {
    const query = validate(searchUserSchema, req.query);
    const { page, limit, q } = query;

    const [{ users, totalUsers }] = await User.aggregate()
      .lookup({
        from: 'roles',
        localField: 'role',
        foreignField: '_id',
        as: 'role',
        pipeline: [{ $project: { name: 1 } }],
      })
      .unwind('role')
      .match(
        q
          ? {
              $or: [
                { username: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { 'role.name': { $regex: q, $options: 'i' } },
              ],
            }
          : {}
      )
      .facet({
        users: [
          { $sort: { 'role.name': 1, createdAt: -1 } },
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

    const role = await Role.exists({ _id: fields.role });
    if (!role) {
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
    await checkOwnership(User, userId, req.user);

    const user = await User.findById(userId);
    if (!user) {
      logger.warn('user not found');
      throw new ResponseError('User not found', 404);
    }

    const { file, fields } = await uploadFile(req, {
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

    if (fields.role) {
      const role = await Role.exists({ _id: fields.role });
      if (!role) {
        logger.warn('validation errors');
        throw new ResponseError('Validation errors', 400, {
          roles: 'Invalid role id',
        });
      }
    }

    if (fields.password)
      fields.password = await bcrypt.hash(fields.password, 10);

    if (file) {
      if (user.avatar !== process.env.DEFAULT_AVATAR_URL) await cloudinary.uploader.destroy(extractPublicId(user.avatar));

      user.avatar = file.secure_url;
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
    await checkOwnership(User, userId, req.user);

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      logger.warn('user not found');
      throw new ResponseError('User not found', 404);
    }

    if (user.avatar !== process.env.DEFAULT_AVATAR_URL) {
      await cloudinary.uploader.destroy(extractPublicId(user.avatar));
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

export default { show, search, create, update, remove, updateProfile };
