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

const getAll = async options => {
  const { limit, search, skip } = options;
  const filter = {};

  if (search) {
    const roles = await Role.find({ name: { $regex: search, $options: 'i' } });

    filter.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { roles: { $in: roles.map(role => role._id) } },
    ];
  }

  const totalUsers = await User.countDocuments(filter);
  const totalPages = Math.ceil(totalUsers / limit);

  const users = await User.find(filter)
    .skip(skip)
    .limit(limit)
    .populate('roles', 'name');

  if (users.length === 0) {
    logger.info(`fetch all users - no users found in database`);
  } else {
    logger.info(`fetch all users - ${users.length} users found`);
  }

  return { users, totalUsers, totalPages };
};

const getById = async id => {
  if (!validateObjectId(id)) {
    logger.warn(`fetch user - invalid or malformed user id ${id}`);
    throw new ResponseError('Invalid id', 400, {
      id: ['Invalid or malformed user id'],
    });
  }

  const user = await User.findById(id).populate('roles');
  if (!user) {
    logger.warn(`fetch user - user not found with id ${id}`);
    throw new ResponseError('User not found', 404);
  }

  logger.info(`fetch user - user found with id ${id}`);
  return user;
};

const create = async data => {
  const { validatedFields, validationErrors } = validateSchema(
    createUserSchema,
    data
  );

  if (validationErrors) {
    logger.warn('create user - invalid request fields');
    throw new ResponseError('Validation errors', 400, validationErrors);
  }

  const existingUser = await User.findOne({ email: validatedFields.email });

  if (existingUser) {
    logger.warn(
      `create user - user already exists with email ${validatedFields.email}`
    );
    throw new ResponseError('Email already in use', 409);
  }

  const roles = await Role.find({
    _id: { $in: validatedFields.roles },
  });

  if (roles.length !== validatedFields.roles.length) {
    logger.warn(`create user - some of the roles is invalid`);
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
    `create user - user successfully created with email ${validatedFields.email}`
  );
};

const update = async (id, request) => {
  if (!validateObjectId(id)) {
    logger.warn(`update user - invalid or malformed user id ${id}`);
    throw new ResponseError('Invalid id', 400, {
      id: ['Invalid or malformed user id'],
    });
  }

  
  const user = await User.findById(id);
  if (!user) {
    logger.warn(`update user - user not found with id ${id}`);
    throw new ResponseError('User not found', 404);
  }
  
  const { validatedFiles, validatedFields, validationErrors } =
  await uploadAndValidate(request, {
    fieldname: 'avatar',
    formSchema: updateUserSchema,
  });

  if (validationErrors) {
    logger.warn('update user - invalid request fields');
    throw new ResponseError('Validation errors', 400, validationErrors);
  }

  const existingUser = await User.findOne({
    email: validatedFields.email,
    isVerified: true,
    _id: { $ne: id },
  });

  if (existingUser) {
    logger.warn(
      `update user - user already exists with email ${validatedFields.email}`
    );
    throw new ResponseError('Email already in use', 409);
  }


  if (validatedFiles) {
    if (user.avatar !== 'default.jpg') {
      await fs.unlink(
        path.join(process.cwd(), process.env.AVATAR_UPLOADS_DIR, user.avatar)
      );
    }

    user.avatar = validatedFiles[0].newFilename;
    logger.info(`update user - avatar from user id ${user._id} successfully updated`);
  }

  if (validatedFields.password) {
    validatedFields.password = await bcrypt.hash(validatedFields.password, 10);
  }

  Object.assign(user, validatedFields);
  await user.save();

  logger.info(`update user - user successfully updated with id ${user._id}`);
  return user;
};

const remove = async id => {
  if (!validateObjectId(id)) {
    logger.info(`delete user - invalid or malformed user id ${id}`);
    throw new ResponseError('Invalid id', 400, {
      id: ['Invalid or malformed user id'],
    });
  }

  const user = await User.findById(id);
  if (!user) {
    logger.warn(`delete user - user not found with id ${id}`);
    throw new ResponseError('User not found', 404);
  }

  if (user.avatar !== 'default.jpg') {
    const avatarPath = path.join(
      process.cwd(),
      process.env.AVATAR_UPLOADS_DIR,
      user.avatar
    );

    await fs.unlink(avatarPath);
    logger.info(`delete user - avatar from user id ${user._id} successfully deleted`);
  }

  await user.deleteOne();
  logger.info(`delete user - user successfully deleted with id ${user._id}`);
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
};
