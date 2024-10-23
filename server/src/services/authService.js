import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import Blacklist from '../models/blacklistModel.js';
import validateSchema from '../utils/validateSchema.js';
import ResponseError from '../utils/responseError.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import ejs from 'ejs';
import sendMail from '../utils/sendMail.js';
import {
  signupSchema,
  signinSchema,
  verifyEmailSchema,
  resetPasswordSchema
} from '../validations/userValidation.js';

const signup = async data => {
  const { validatedFields, validationErrors } = validateSchema(
    signupSchema,
    data
  );

  if (validationErrors) {
    logger.warn(`signup - invalid request fields`);
    throw new ResponseError('Validation errors', 400, validationErrors);
  }

  const existingUser = await User.findOne({ email: validatedFields.email });
  if (existingUser) {
    logger.warn(
      `signup - user already exists with email ${validatedFields.email}`
    );
    return;
  }

  let defaultRole = await Role.findOne({ name: 'user' });
  if (!defaultRole) {
    defaultRole = await Role.create({name: 'user'});
  }

  validatedFields.password = await bcrypt.hash(validatedFields.password, 10);

  const newUser = await User.create({
    ...validatedFields,
    roles: [defaultRole._id],
  });

  const html = await ejs.renderFile('./src/views/emailVerification.ejs', {
    user: newUser,
    url: `${process.env.CLIENT_URL}/email-verification/${newUser.verificationToken}`,
  });

  await sendMail(newUser.email, 'Email Verification', html);
  logger.info(
    `signup - email has been sent to ${validatedFields.email}`
  );
};

const emailVerification = async token => {
  const updatedUser = await User.findOneAndUpdate(
    {
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    },
    {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
    {
      new: true,
    }
  );

  if (!updatedUser) {
    logger.warn(`email verification - token is invalid or expired`);
    throw new ResponseError('Invalid verification token', 401);
  }

  logger.info(
    `email verification - user is verified for email ${updatedUser.email}`
  );
};

const resendEmailVerification = async data => {
  const { validatedFields, validationErrors } = validateSchema(verifyEmailSchema, data);

  if (validationErrors) {
    logger.warn('resend email verification - invalid request fields');
    throw new ResponseError('Validation errors', 400, validationErrors)
  }

  const updatedUser = await User.findOneAndUpdate(
    {
      email: validatedFields.email,
      isVerified: false,
    },
    {
      verificationToken: crypto.randomBytes(32).toString('hex'),
      verificationTokenExpires: Date.now() + (24 * 60 * 60 * 1000),
    },
    { 
      new: true,
    }
  );

  if (!updatedUser) {
    logger.warn(
      `resend email verification - user is not registered with email ${validatedFields.email}`
    );

    return;
  }

  const html = await ejs.renderFile('./src/views/emailVerification.ejs', {
    user: updatedUser,
    url: `${process.env.CLIENT_URL}/email-verification/${updatedUser.verificationToken}`,
  });

  await sendMail(updatedUser.email, 'Email Verification', html);
  logger.info(
    `resend email verification - email has been sent to ${updatedUser.email}`
  );
}

const signin = async data => {
  const { validatedFields, validationErrors } = validateSchema(signinSchema, data);

  if (validationErrors) {
    logger.warn('signin - invalid request fields');
    throw new ResponseError('Validation errors', 400, validationErrors)
  }

  const user = await User.findOne({ email: validatedFields.email })
    .populate({
      path: 'roles',
      populate: {
        path: 'permissions'
      }
    });

  if (!user) {
    logger.warn('signin - user is not registered');
    throw new ResponseError('Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(validatedFields.password, user.password);

  if (!isMatch) {
    logger.warn(
      `signin - password is not matched from user email ${validatedFields.email}`
    );
    throw new ResponseError('Invalid email or password', 401);
  }

  const roles = user.roles.map(role => role.name);
  const permissions = user.roles.reduce((acc, role) => {
    role.permissions.forEach(permission => {
      acc.push(permission);
    });

    return acc;
  }, []);

  const token = jwt.sign(
    { 
      id: user._id,
      roles
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { 
      id: user._id,
      roles
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES }
  );

  user.refreshToken = refreshToken;
  await user.save();

  logger.info(`signin - user logged in with email ${user.email}`);

  return {
    token,
    refreshToken,
    user,
    permissions,
    roles
  }
}

const signout = async refreshToken => {
  if (!refreshToken) {
    logger.warn('signout - refresh token is not provided');
    throw new ResponseError('Invalid refresh token', 401);
  }
  
  const updatedUser = await User.findOneAndUpdate(
    { refreshToken },
    { refreshToken: null },
    { new: true }
  );

  if (!updatedUser) {
    logger.warn('signout - refresh token not found in database');
    throw new ResponseError('Invalid refresh token', 401);
  }

  await Blacklist.create({ token: refreshToken });

  logger.info(
    `signout - user loggout successfully with email ${updatedUser.email}`
  );
}

const refreshToken = async refreshToken => {
  if (!refreshToken) {
    logger.warn('refresh token - token is not provided');
    throw new ResponseError('Invalid refresh token', 401);
  }

  const blacklistedToken = await Blacklist.findOne({ token: refreshToken });

  if (blacklistedToken) {
    logger.warn(
      `refresh token - token ${refreshToken} has been blacklisted`
    );
    throw new ResponseError('Invalid refresh token', 401);
  }

  const user = await User.findOne({ refreshToken })
    .populate('roles');

  if (!user) {
    logger.warn('refresh token - refresh token not found in database');
    throw new ResponseError('Invalid refresh token', 401);
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  const roles = user.roles.map(role => role.name);
  const newToken = jwt.sign(
    {
      id: user._id,
      roles,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES,
    }
  );

  logger.info(
    `refresh token - new access token has been generated for email ${user._id}`
  );

  return newToken;
}

const requestResetPassword = async data => {
  const { validatedFields, validationErrors } = validateSchema(
    verifyEmailSchema,
    data
  );

  if (validationErrors) {
    logger.warn('request reset password - invalid request fields');
    throw new ResponseError('Validation errors', 400, validationErrors);
  }

  const user = await User.findOne({
    email: validatedFields.email,
    isVerified: true,
  });

  if (!user) {
    logger.warn('request reset password - user is not registered');
    return;
  }

  user.resetToken = crypto.randomBytes(32).toString('hex');
  user.resetTokenExpires = Date.now() + (1 * 60 * 60 * 1000);
  const html = await ejs.renderFile('./src/views/resetPassword.ejs', {
    user: user,
    url: `${process.env.CLIENT_URL}/reset-password/${user.resetToken}`,
  });

  await sendMail(user.email, 'Reset Password', html);
  await user.save();

  logger.info(
    `request reset password - email has been sent to ${user.email}`
  );
}

const resetPassword = async (data, token) => {
  const { validatedFields, validationErrors } = validateSchema(
    resetPasswordSchema,
    data
  );

  if (validationErrors) {
    logger.warn('reset password - invalid request fields');
    throw new ResponseError('validation errors', 400, validationErrors);
  }

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    logger.warn(`reset password - token is invalid or has expired}`);
    throw new ResponseError('Invalid reset token', 401);
  }

  user.password = await bcrypt.hash(validatedFields.newPassword, 10);
  user.resetToken = null;
  user.resetTokenExpires = null;

  await user.save();

  logger.info(
    `reset password - password has been reset for email ${user.email}`
  );
}

export default { 
  signup,
  emailVerification,
  resendEmailVerification,
  signin,
  signout,
  refreshToken,
  requestResetPassword,
  resetPassword
};
