import {
  createUserSchema,
  updateUserSchema
} from '../validations/userValidation.js';
import User from '../models/userModel.js';
import validation from '../utils/validation.js';
import ResponseError from '../utils/responseError.js';
import logger from '../config/logger.js';
import bcrypt from 'bcrypt';

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      logger.info(`get user failed: user not found with id ${req.params.id}`);
      throw new ResponseError('User not found', 404);
    }

    logger.info(`get user success: user found with id ${req.params.id}`);
    res.json({
      data: user,
    });
  } catch (e) {
    next(e);
  }
}

export const createUser = async (req, res, next) => {
  try {
    const value = validation(createUserSchema, req.body);
    
    const user = await User.findOne({ email: value.email });
    if (user) {
      logger.info(`create user failed: user already exists with email ${value.email}`);
      throw new ResponseError('Email already in use', 409);
    }
    
    value.password = await bcrypt.hash(value.password, 10);
    await User.create(value);

    logger.info(`create user success: user created with email ${value.email}`);
    res.status(201).json({message: 'User created successfully'})
  } catch (e) {
    next(e);
  }
}