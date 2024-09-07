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
      logger.info(
        `create user failed: user already exists with email ${value.email}`
      );
      throw new ResponseError('Email already in use', 409);
    }

    value.password = await bcrypt.hash(value.password, 10);
    await User.create(value);

    logger.info(`create user success: user created with email ${value.email}`);
    res.status(201).json({ message: 'User created successfully' });
  } catch (e) {
    next(e);
  }
};
