import {
  createUserSchema,
  updateUserSchema,
} from '../validations/userValidation.js';
import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import validateSchema from '../utils/validateSchema.js';
import uploadAndValidate from '../utils/uploadAndValidate.js';
import ResponseError from '../utils/responseError.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcrypt';
import path from 'path';
import * as fs from 'node:fs/promises';
import validateObjectId from '../utils/validateObjectId.js';

export const getUserById = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed user id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed user id'] });
    }

    const user = await User.findById(req.params.id).populate('roles');

    if (!user) {
      logger.info(
        `resource not found - user not found with id ${req.params.id}`
      );
      throw new ResponseError('User not found', 404);
    }

    logger.info(`fetch user success - user found with id ${req.params.id}`);
    res.json({
      code: 200,
      message: 'User found',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    const filter = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      const roles = await Role.find({ name: searchRegex }).select('_id');

      filter.$or = [
        { username: searchRegex },
        { email: searchRegex },
        { roles: { $in: roles.map(role => role._id) } },
      ];
    }

    const users = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('roles', 'name');

    if (users.length === 0) {
      logger.info('resource not found - no users found in database');
      return res.json({
        code: 200,
        message: 'No users found',
        data: [],
      });
    }

    logger.info(`fetch all users success - ${users.length} users found`);
    res.json({
      code: 200,
      message: 'Users found',
      data: users,
      meta: {
        pageSize: limit,
        totalItems: totalUsers,
        currentPage: page,
        totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { validatedFields, validationErrors } = validateSchema(
      createUserSchema,
      req.body
    );

    if (validationErrors) {
      logger.info('create user failed - invalid request fields');
      throw new ResponseError('Validation errors', 400, validationErrors);
    }

    const userToUpdate = await User.findOne({ email: validatedFields.email });

    if (userToUpdate) {
      logger.info(
        `create user failed - user already exists with email ${validatedFields.email}`
      );
      throw new ResponseError('Email already in use', 409);
    }

    const roles = await Role.find({ _id: { $in: validatedFields.roles } });

    if (roles.length !== validatedFields.roles.length) {
      logger.info(`create user failed - some of the roles is invalid`);
      throw new ResponseError('Validation errors', 400, {
        roles: ['Some of the roles is invalid'],
      });
    }

    validatedFields.password = await bcrypt.hash(validatedFields.password, 10);
    await User.create({
      ...validatedFields,
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    });

    logger.info(
      `create user success - user created with email ${validatedFields.email}`
    );
    res.status(201).json({
      code: 201,
      message: 'User created successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed user id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed user id'] });
    }

    const { validatedFiles, validatedFields, validationErrors } =
      await uploadAndValidate(req, { fieldname: 'avatar' }, updateUserSchema);

    if (validationErrors) {
      logger.info('update user failed - invalid request fields');
      throw new ResponseError('Validation errors', 400, validationErrors);
    }

    const userToUpdate = await User.findById(req.params.id);

    if (!userToUpdate) {
      logger.info(
        `update user failed - user not found with id ${req.params.id}`
      );
      throw new ResponseError('User not found', 404);
    }

    const existingUserEmail = await User.findOne({
      email: validatedFields.email,
      _id: { $ne: req.params.id },
    });

    if (existingUserEmail) {
      logger.info(
        `update user failed - user already exists with email ${existingUserEmail.email}`
      );
      throw new ResponseError('Email already in use', 409);
    }

    if (validatedFiles?.avatar) {
      if (userToUpdate.avatar !== 'default.jpg') {
        await fs.unlink(
          path.join(
            process.cwd(),
            process.env.AVATAR_UPLOADS_DIR,
            userToUpdate.avatar
          )
        );
      }

      userToUpdate.avatar = validatedFiles.avatar[0].newFilename;
    }

    if (validatedFields.password) validatedFields.password = await bcrypt.hash(validatedFields.password, 10);
    
    Object.assign(userToUpdate, validatedFields);
    await userToUpdate.save();

    logger.info(
      `update user success - user updated with id ${userToUpdate._id}`
    );
    res.json({
      code: 200,
      message: 'User updated successfully',
      data: userToUpdate,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed user id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: ['Invalid or malformed user id'] });
    }

    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      logger.info(
        `delete user failed - user not found with id ${req.params.id}`
      );
      throw new ResponseError('User not found', 404);
    }

    if (userToDelete.avatar !== 'default.jpg') {
      const avatarPath = path.join(
        process.cwd(),
        process.env.AVATAR_UPLOADS_DIR,
        userToDelete.avatar
      );
      await fs.unlink(avatarPath);
    }

    userToDelete.remove();

    logger.info(`delete user success - user deleted with id ${targetUserId}`);
    res.json({
      code: 200,
      message: 'User deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
