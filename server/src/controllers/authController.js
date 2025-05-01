import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import Blacklist from '../models/blacklistModel.js';
import validate from '../utils/validate.js';
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
  resetPasswordSchema,
} from '../validations/userValidation.js';

const signup = async (req, res, next) => {
  try {
    const fields = validate(signupSchema, req.body);

    const user = await User.findOne({
      $or: [{ username: fields.username }, { email: fields.email }],
    });

    if (user) {
      logger.warn('user already exists');
      return res.json({
        code: 200,
        message: 'Please check your email to verify your account',
      });
    }

    const userRole = await Role.findOne({ name: 'user' });
    fields.password = await bcrypt.hash(fields.password, 10);

    const newUser = await User.create({
      ...fields,
      role: userRole._id,
    });

    const html = await ejs.renderFile('./src/views/verifyEmail.ejs', {
      username: newUser.username,
      url: `${process.env.CLIENT_URL}/verify-email/${newUser.verificationToken}`,
    });

    await sendMail(newUser.email, 'Verify Email', html);

    logger.info('verification email sent successfully');
    res.json({
      code: 200,
      message: 'Please check your email to verify your account',
    });
  } catch (e) {
    next(e);
  }
};

const verifyEmail = async (req, res, next) => {
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
      logger.warn('verification token is invalid or has expired');
      throw new ResponseError(
        'Verification token is invalid or has expired',
        401
      );
    }

    logger.info('email verified successfully');
    res.json({
      code: 200,
      message: 'Email verified successfully',
    });
  } catch (e) {
    next(e);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const fields = validate(verifyEmailSchema, req.body);

    const user = await User.findOneAndUpdate(
      {
        email: fields.email,
        isVerified: false,
      },
      {
        verificationToken: crypto.randomBytes(32).toString('hex'),
        verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
      },
      { new: true }
    );

    if (!user) {
      logger.warn('user is not registered');
      return res.json({
        code: 200,
        message: 'Please check your email to verify your account',
      });
    }

    const html = await ejs.renderFile('./src/views/verifyEmail.ejs', {
      username: user.username,
      url: `${process.env.CLIENT_URL}/verify-email/${user.verificationToken}`,
    });

    await sendMail(user.email, 'Verify Email', html);
    logger.info('verification email sent successfully');

    res.json({
      code: 200,
      message: 'Please check your email to verify your account',
    });
  } catch (e) {
    next(e);
  }
};

const signin = async (req, res, next) => {
  try {
    const fields = validate(signinSchema, req.body);

    const user = await User.findOne({ email: fields.email }).populate('role');
    if (!user) {
      logger.warn('user is not registered');
      throw new ResponseError('Email or password is invalid', 401);
    }

    const isMatch = await bcrypt.compare(fields.password, user.password);
    if (!isMatch) {
      logger.warn('email or password is invalid');
      throw new ResponseError('Email or password is invalid', 401);
    }

    const payload = { id: user._id, role: user.role.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: parseInt(process.env.JWT_EXPIRES),
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES,
    });

    user.refreshToken = refreshToken;
    await user.save();

    const transformedUser = user.toObject();

    logger.info('signed in successfully');
    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        code: 200,
        message: 'Signed in successfully',
        data: {
          _id: transformedUser._id,
          username: transformedUser.username,
          email: transformedUser.email,
          avatar: transformedUser.avatar,
          role: transformedUser.role.name,
          token,
        },
      });
  } catch (e) {
    next(e);
  }
};

const signout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      logger.warn('refresh token is not provided');
      throw new ResponseError('Refresh token is not provided', 401);
    }

    const user = await User.findOneAndUpdate(
      { refreshToken },
      { refreshToken: null }
    );

    if (!user) {
      logger.warn('refresh token not found in the database');
      throw new ResponseError('Refresh token is invalid', 401);
    }

    await Blacklist.create({ token: refreshToken });

    logger.info('signed out successfully');
    res.clearCookie('refreshToken');
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      logger.warn('refresh token is not provided');
      throw new ResponseError('Refresh token is not provided', 401);
    }

    const blacklistedToken = await Blacklist.exists({ token: refreshToken });
    if (blacklistedToken) {
      logger.warn('refresh token has blacklisted');
      throw new ResponseError('Refresh token is invalid', 401);
    }

    const user = await User.findOne({ refreshToken }).populate('role');
    if (!user) {
      logger.warn('refresh token not found in the database');
      throw new ResponseError('Refresh token is invalid', 401);
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          logger.warn('refresh token has expired');
          throw new ResponseError('Refresh token has expired', 401);
        }

        logger.warn('refresh token is invalid');
        throw new ResponseError('Refresh token is invalid', 401);
      }
    });

    const newToken = jwt.sign(
      { id: user._id, role: user.role.name },
      process.env.JWT_SECRET,
      { expiresIn: parseInt(process.env.JWT_EXPIRES) }
    );

    logger.info('token refreshed successfully');
    res.json({
      code: 200,
      message: 'Token refreshed successfully',
      data: { token: newToken },
    });
  } catch (e) {
    next(e);
  }
};

const requestResetPassword = async (req, res, next) => {
  try {
    const fields = validate(verifyEmailSchema, req.body);

    const user = await User.findOneAndUpdate(
      {
        email: fields.email,
        isVerified: true,
      },
      {
        resetToken: crypto.randomBytes(32).toString('hex'),
        resetTokenExpires: Date.now() + 1 * 60 * 60 * 1000,
      },
      { new: true }
    );

    if (!user) {
      logger.warn('user is not registered');
      return res.json({
        code: 200,
        message: 'Please check your email to reset your password',
      });
    }

    const html = await ejs.renderFile('./src/views/resetPassword.ejs', {
      username: user.username,
      url: `${process.env.CLIENT_URL}/reset-password/${user.resetToken}`,
    });

    await sendMail(user.email, 'Reset Password', html);

    logger.info('reset password email sent successfully');
    res.json({
      code: 200,
      message: 'Please check your email to reset your password',
    });
  } catch (e) {
    next(e);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const fields = validate(resetPasswordSchema, req.body);

    const user = await User.findOneAndUpdate(
      {
        resetToken: req.params.resetToken,
        resetTokenExpires: { $gt: Date.now() },
      },
      {
        password: await bcrypt.hash(fields.newPassword, 10),
        resetToken: null,
        resetTokenExpires: null,
      }
    );

    if (!user) {
      logger.warn('reset token is invalid or has expired');
      throw new ResponseError('Reset token is invalid or has expired', 401);
    }

    logger.info('password reset successfully');
    res.json({
      code: 200,
      message: 'Password reset successfully',
    });
  } catch (e) {
    next(e);
  }
};

export default {
  signup,
  signin,
  signout,
  refreshToken,
  requestResetPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};
