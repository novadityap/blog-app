import {
  signupSchema,
  signinSchema,
  verifyEmailSchema,
  resetPasswordSchema
} from '../validations/userValidation.js';
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

export const signup = async (req, res, next) => {
  try {
    const {validatedFields, validationErrors} = validateSchema(signupSchema, req.body);

    if (validationErrors) {
      logger.info(`signup failed - invalid request fields`);
      throw new ResponseError('Validation errors', 400, validationErrors)
    }

    const existingUser = await User.findOne({ email: validatedFields.email });

    if (!existingUser) {
      const defaultRole = await Role.findOne({ name: 'user' });

      if (!defaultRole) {
        logger.info(`signup failed - default role not found`);
        throw new ResponseError('Internal server error', 500);
      }

      validatedFields.password = await bcrypt.hash(validatedFields.password, 10);
      const newUser = await User.create({
        ...validatedFields,
        roles: [defaultRole._id]
      });
      const html = await ejs.renderFile('./views/emailVerification.ejs', {
        user: newUser,
        url: `${process.env.CLIENT_URL}/email-verification/${newUser.verificationToken}`
      });

      sendMail(newUser.email, 'Email Verification', html);
      logger.info(
        `signup success - user created and email has been sent to ${validatedFields.email}`
      );
    }

    logger.info(`signup failed - user already exists with email ${validatedFields.email}`);
    res.json({ 
      code: 200,
      message: 'Please check your email to verify your account' 
    });
  } catch (err) {
    next(err);
  }
};

export const emailVerification = async (req, res, next) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      {
        verificationToken: req.params.token,
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
      logger.info(`email verification failed - token is invalid or expired`);
      throw new ResponseError('Token is invalid or expired', 401);
    }

    logger.info(
      `email verification success - user is verified for email ${updatedUser.email}`
    );
    res.json({ 
      code: 200,
      message: 'Email has been verified' 
    });
  } catch (e) {
    next(e);
  }
};

export const resendEmailVerification = async (req, res, next) => {
  try {
    const { validatedFields, validationErrors } = validateSchema(resendEmailSchema, req.body);

    if (validationErrors) {
      logger.info('resend email verification failed - invalid request fields');
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
        runValidators: true
      }
    );

    if (!updatedUser) {
      logger.info(
        `resend email verification failed - user is not registered with email ${value.email}`
      );
      return res.json({
        code: 200,
        message: 'Please check your email to verify your account',
      });
    }

    const html = await ejs.renderFile('./views/emailVerification.ejs', {
      user: updatedUser,
      url: `${process.env.CLIENT_URL}/email-verification/${updatedUser.verificationToken}`,
    });

    await sendMail(updatedUser.email, 'Email Verification', html);
    logger.info(
      `resend email verification success - email has been sent to ${updatedUser.email}`
    );
    res.json({ 
      code: 200,
      message: 'Please check your email to verify your account' 
    });
  } catch (e) {
    next(e);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { validatedFields, validationErrors } = validateSchema(signinSchema, req.body);

    if (validationErrors) {
      logger.info('signin failed - invalid request fields');
      throw new ResponseError('Validation errors', 400, validationErrors)
    }

    const existingUser = await User.findOne({ email: validatedFields.email });

    if (!existingUser) {
      logger.info('signin failed - user is not registered');
      throw new ResponseError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(validatedFields.password, existingUser.password);

    if (!isMatch) {
      logger.info(
        `signin failed - password is not matched from user email ${validatedFields.email}`
      );
      throw new ResponseError('Invalid email or password', 401);
    }

    const token = jwt.sign(
      { 
        id: existingUser._id,
        roles: existingUser.roles
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES }
    );

    const refreshToken = jwt.sign(
      { 
        id: existingUser._id,
        roles: existingUser.roles
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES }
    );

    existingUser.refreshToken = refreshToken;
    await existingUser.save();

    logger.info(`signin success - user logged in with email ${existingUser.email}`);

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        code: 200,
        message: 'User logged in successfully',
        data: {
          ...existingUser.toJSON(),
          token,
        }
      });
  } catch (e) {
    next(e);
  }
};

export const signout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      logger.info(
        'signout failed - refresh token is not provided'
      );
      throw new ResponseError('Refresh token is not provided', 401);
    }

    const updatedUser = await User.findOneAndUpdate(
      { refreshToken },
      { refreshToken: null },
      { new: true }
    );

    if (!updatedUser) {
      logger.info(
        'signout failed - refresh token not found in database'
      );
      throw new ResponseError('Refresh token is invalid', 401);
    }

    await Blacklist.create({ token: refreshToken });

    logger.info(
      `signout success - user loggout successfully with email ${updatedUser.email}`
    );

    res.clearCookie('refreshToken');
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      logger.info('refresh token failed - token is not provided');
      throw new ResponseError('Refresh token is not provided', 401);
    }

    const blacklistedToken = await Blacklist.findOne({ token: refreshToken });

    if (blacklistedToken) {
      logger.info(`refresh token failed - refresh token is blacklisted with token - ${refreshToken}`);
      throw new ResponseError('Token has been revoked', 401);
    }

    const userWithToken = await User.findOne({ refreshToken });

    if (!userWithToken) {
      logger.info(`refresh token failed - refresh token not found in database`);
      throw new ResponseError('Refresh token is invalid', 401);
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newToken = jwt.sign({ 
      id: userWithToken._id,
      roles: userWithToken.roles
    }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    logger.info(
      `refresh token success - new access token has been generated for email ${userWithToken.email}`
    );
    res.json({
      code: 200,
      message: 'Token refreshed successfully',
      data: { token: newToken },
    });
  } catch (e) {
    next(e);
  }
};

export const requestResetPassword = async (req, res, next) => {
  try {
    const { validatedFields, validationErrors } = validateSchema(verifyEmailSchema, req.body);

    if (validationErrors) {
      logger.info('request reset password failed - invalid request fields');
      throw new ResponseError('Validation errors', 400, validationErrors);
    }

    const existingUser = await User.findOne({ 
      email: validatedFields.email,
      isVerified: true
    });
    
    if (!existingUser) {
      logger.info('request reset password failed - user is not registered');
      return res.json({
        code: 200,
        message: 'Please check your email to reset your password'
      });
    }

    existingUser.resetToken = crypto.randomBytes(32).toString('hex');
    existingUser.resetTokenExpires = Date.now() + (1 * 60 * 60 * 1000);
    const html = await ejs.renderFile('./views/resetPassword.ejs', {
      user: existingUser,
      url: `${process.env.CLIENT_URL}/reset-password/${existingUser.resetToken}`
    });

    await sendMail(existingUser.email, 'Reset Password', html);
    await existingUser.save();

    logger.info(`request reset password success - email has been sent to ${existingUser.email}`);
    res.json({
      code: 200,
      message: 'Please check your email to reset your password'
    });
  } catch (err) {
    next(err);
  }
}

export const resetPassword = async (req, res, next) => {
  try {
    const { validatedFields, validationErrors } = validateSchema(resetPasswordSchema, req.body);

    if (validationErrors) {
      logger.info('reset password failed - invalid request fields');
      throw new ResponseError('validation errors', 400, validationErrors);
    }

    const userToReset = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpires: { $gt: Date.now() }
    })

    if (!userToReset) {
      logger.info(`reset password failed - token is invalid or has expired with user ${userToReset.email}`);
      throw new ResponseError('Token is invalid or has expired', 400);
    }

    const isMatch = await bcrypt.compare(validatedFields.oldPassword, userToReset.password);

    if (!isMatch) {
      logger.info(`reset password failed - old password is incorrect with user ${userToReset.email}`);
      throw new ResponseError('The provided credentials are incorrect', 401);
    }

    userToReset.password = await bcrypt.hash(validatedFields.newPassword, 10);
    userToReset.resetToken = null;
    userToReset.resetTokenExpires = null;

    await userToReset.save();

    logger.info(`reset password success - password has been reset for email ${userToReset.email}`);
    res.json({
      code: 200,
      message: 'Password has been reset successfully'
    });
  } catch (err) {
    next(err);
  }
}
