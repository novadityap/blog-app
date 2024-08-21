import {
  signupSchema,
  signinSchema,
  resendEmailSchema,
} from '../validations/userValidation.js';
import User from '../models/userModel.js';
import Blacklist from '../models/blacklistModel.js';
import validation from '../utils/validation.js';
import ResponseError from '../utils/responseError.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';
import ejs from 'ejs';
import sendMail from '../utils/sendMail.js';

export const signup = async (req, res, next) => {
  try {
    const value = validation(signupSchema, req.body);
    let user = await User.findOne({ email: value.email });

    if (!user) {
      value.password = await bcrypt.hash(value.password, 10);
      user = await User.create(value);
      const html = await ejs.renderFile('./views/emailVerification.ejs', {
        user: user,
        url: `${process.env.CLIENT_URL}/email-verification/${user.verificationToken}`,
      });

      sendMail(user.email, 'Email Verification', html);
      logger.info(
        `signup success: user created and email has been sent to ${value.email}`
      );
    }

    logger.info(`signup failed: user already exists with email ${value.email}`);
    res.json({ message: 'Please check your email to verify your account' });
  } catch (e) {
    next(e);
  }
};

export const emailVerification = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        verificationToken: req.params.verificationToken,
        verificationTokenExpires: { $gt: Date.now() },
      },
      {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
      { new: true }
    );

    if (!user) {
      logger.info(`email verification failed: token is invalid or expired`);
      throw new ResponseError('Verification Token is invalid or expired', 401);
    }

    logger.info(
      `email verification success: user is verified for email ${user.email}`
    );
    res.json({ message: 'Email has been verified' });
  } catch (e) {
    next(e);
  }
};

export const resendEmailVerification = async (req, res, next) => {
  try {
    const value = validation(resendEmailSchema, req.body);

    const user = await User.findOneAndUpdate(
      {
        email: value.email,
        isVerified: false,
      },
      {
        verificationToken: crypto.randomBytes(32).toString('hex'),
        verificationTokenExpires: Date.now() + 3600000,
      },
      { new: true }
    );

    if (!user) {
      logger.info(
        `resend email verification failed: user is not registered with email ${value.email}`
      );
      return res.json({
        message: 'Please check your email to verify your account',
      });
    }

    const html = await ejs.renderFile('./views/emailVerification.ejs', {
      user: user,
      url: `${process.env.CLIENT_URL}/email-verification/${user.verificationToken}`,
    });

    sendMail(user.email, 'Email Verification', html);
    logger.info(
      `resend email verification success: email has been sent to ${value.email}`
    );
    res.json({ message: 'Please check your email to verify your account' });
  } catch (e) {
    next(e);
  }
};

export const signin = async (req, res, next) => {
  try {
    const value = validation(signinSchema, req.body);
    const user = await User.findOne({ email: value.email });

    if (!user) {
      logger.info('signin failed: user is not registered');
      throw new ResponseError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(value.password, user.password);
    if (!isMatch) {
      logger.info(
        `signin failed: password is incorrect for email ${value.email}`
      );
      throw new ResponseError('Invalid email or password', 401);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES,
      }
    );

    user.refreshToken = refreshToken;
    await user.save();

    logger.info(`signin success: user logged in with email ${value.email}`);

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        user,
        token,
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
        `signout failed: refresh token is not provided with email ${user.email}`
      );
      throw new ResponseError('Refresh token is not provided', 401);
    }

    const user = await User.findOneAndUpdate(
      { refreshToken },
      { refreshToken: null },
      { new: true }
    );

    if (!user) {
      logger.info(
        `signout failed: refresh token not found in database with email ${user.email}`
      );
      throw new ResponseError('Refresh token is invalid', 401);
    }

    await Blacklist.create({ token: refreshToken });

    logger.info(
      `signout success: user loggout successfully with email ${user.email}`
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
      logger.info(`refresh token failed: token is not provided`);
      throw new ResponseError('Refresh token is not provided', 401);
    }

    const blacklistedToken = await Blacklist.findOne({ token: refreshToken });
    if (blacklistedToken) {
      logger.info(`refresh token failed: refresh token is blacklisted`);
      throw new ResponseError('Token has been revoked', 401);
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      logger.info(`refresh token failed: refresh token not found in database`);
      throw new ResponseError('Refresh token is invalid', 401);
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    logger.info(
      `refresh token success: new access token has been generated with token - ${token}`
    );
    res.json({ token });
  } catch (e) {
    next(e);
  }
};
