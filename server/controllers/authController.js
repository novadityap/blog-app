import {
  signupSchema,
  signinSchema,
  resendEmailSchema,
} from '../validations/userValidation.js';
import User from '../models/userModel.js';
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
    const {validatedData, validationErrors} = validateSchema(signupSchema, req.body);

    if (validationErrors) {
      logger.info('validation error');
      throw new ResponseError('Validation error', 400, validationErrors)
    }

    const existingUser = await User.findOne({ email: validatedData.email });

    if (!existingUser) {
      validatedData.password = await bcrypt.hash(validatedData.password, 10);
      const newUser = await User.create(validatedData);
      const html = await ejs.renderFile('./views/emailVerification.ejs', {
        user: newUser,
        url: `${process.env.CLIENT_URL}/email-verification/${newUser.verificationToken}`,
      });

      sendMail(newUser.email, 'Email Verification', html);
      logger.info(
        `signup success - user created and email has been sent to ${validatedData.email}`
      );
    }

    logger.info(`signup failed - user already exists with email ${validatedData.email}`);
    res.json({ 
      code: 200,
      message: 'Please check your email to verify your account' 
    });
  } catch (e) {
    next(e);
  }
};

export const emailVerification = async (req, res, next) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      {
        verificationToken: req.params.verificationToken,
        verificationTokenExpires: { $gt: Date.now() },
      },
      {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      logger.info(`email verification failed - token is invalid or expired`);
      throw new ResponseError('Verification Token is invalid or expired', 401);
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
    const { validatedData, validationErrors } = validateSchema(resendEmailSchema, req.body);

    if (validationErrors) {
      logger.info('validation error');
      throw new ResponseError('Validation error', 400, validationErrors)
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        email: validatedData.email,
        isVerified: false,
      },
      {
        verificationToken: crypto.randomBytes(32).toString('hex'),
        verificationTokenExpires: Date.now() + 3600000,
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

    sendMail(updatedUser.email, 'Email Verification', html);
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
    const { validatedData, validationErrors } = validateSchema(signinSchema, req.body);

    if (validationErrors) {
      logger.info('validation error');
      throw new ResponseError('Validation error', 400, validationErrors)
    }

    const existingUser = await User.findOne({ email: validatedData.email });

    if (!existingUser) {
      logger.info('signin failed - user is not registered');
      throw new ResponseError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(validatedData.password, existingUser.password);

    if (!isMatch) {
      logger.info(
        `signin failed - password is not matched from user email ${validatedData.email}`
      );
      throw new ResponseError('Invalid email or password', 401);
    }

    const token = jwt.sign(
      { 
        id: existingUser._id,
        role: existingUser.role
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES }
    );

    const refreshToken = jwt.sign(
      { 
        id: existingUser._id,
        role: existingUser.role
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

    const newToken = jwt.sign({ userId: userWithToken._id }, process.env.JWT_SECRET, {
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
