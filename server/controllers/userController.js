import {
  createUserSchema,
  updateUserSchema,
} from '../validations/userValidation.js';
import User from '../models/userModel.js';
import validateSchema from '../utils/validateSchema.js';
import validateMultipart from '../utils/validateMultipart.js';
import ResponseError from '../utils/responseError.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';

export const fetchUserById = async (req, res, next) => {
  try {
    const user = await User.findById(targetUserId);

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
  } catch (e) {
    next(e);
  }
};

export const fetchAllUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find();

    if (allUsers.length === 0) {
      logger.info('resource not found - no users found in database');
      throw new ResponseError('No users found', 404, null, []);
    }

    logger.info(`fetch all users success - ${allUsers.length} users found`);
    res.json({
      code: 200,
      message: 'Users found',
      data: allUsers,
    });
  } catch (e) {
    next(e);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { validatedData, validationErrors } = validateSchema(
      createUserSchema,
      req.body
    );

    if (validationErrors) {
      logger.info('validation error');
      throw new ResponseError('Validation error', 400, validationErrors);
    }

    const existingUser = await User.findOne({ email: validatedData.email });

    if (existingUser) {
      logger.info(
        `create user failed - user already exists with email ${validatedData.email}`
      );
      throw new ResponseError('Email already in use', 409);
    }

    validatedData.password = await bcrypt.hash(validatedData.password, 10);
    await User.create({
      ...validatedData,
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    });

    logger.info(
      `create user success - user created with email ${validatedData.email}`
    );
    res.status(201).json({
      code: 201,
      message: 'User created successfully',
    });
  } catch (e) {
    next(e);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { validatedFiles, validationErrors, validatedData } =
      await validateMultipart.single(req, updateUserSchema, 'avatar');

    if (validationErrors) {
      logger.info('validation error');
      throw new ResponseError('Validation error', 400, validationErrors);
    }

    const existingUserEmail = await User.findOne({
      email: validatedData.email,
      _id: { $ne: req.params.id },
    });

    if (existingUserEmail) {
      logger.info(
        `update user failed - user already exists with email ${existingUserEmail.email}`
      );
      throw new ResponseError('Email already in use', 409);
    }

    const existingUser = await User.findById(req.params.id);

    if (!existingUser) {
      logger.info(
        `update user failed - user not found with id ${req.params.id}`
      );
      throw new ResponseError('User not found', 404);
    }

    let avatarFilename;

    if (validatedFiles.avatar) {
      avatarFilename = validatedFiles.avatar[0].newFilename;
      const oldAvatarFilename = existingUser.avatar;
      const oldAvatarPath = path.join(
        process.cwd(),
        process.env.AVATAR_UPLOADS_DIR,
        oldAvatarFilename
      );

      if (oldAvatarFilename !== 'default.jpg') {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    validatedData.password = await bcrypt.hash(validatedData.password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...validatedData,
        avatar: avatarFilename,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      logger.info(
        `update user failed - user not found with id ${req.params.id}`
      );
      throw new ResponseError('User not found', 404);
    }

    logger.info(
      `update user success - user updated with id ${updatedUser._id}`
    );
    res.json({
      code: 200,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (e) {
    next(e);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await User.findById(req.params.id);

    if (!deletedUser) {
      logger.info(
        `delete user failed - user not found with id ${targetUserId}`
      );
      throw new ResponseError('User not found', 404);
    }

    const avatarPath = path.join(process.cwd(), process.env.AVATAR_UPLOADS_DIR, deletedUser.avatar);
    
    if (deletedUser.avatar !== 'default.jpg') fs.unlinkSync(avatarPath);

    await User.findByIdAndDelete(req.params.id);

    logger.info(`delete user success - user deleted with id ${targetUserId}`);
    res.json({
      code: 200,
      message: 'User deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
