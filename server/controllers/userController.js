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

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    logger.info(`get all users success: ${users.length} users found`);
    res.json({ data: users });
  } catch (e) {
    next(e);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const value = validation(createUserSchema, req.body);

    const user = await User.findOne({ email: value.email });
    if (user) {
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
