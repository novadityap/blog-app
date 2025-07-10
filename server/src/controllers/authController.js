import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import RefreshToken from '../models/refreshTokenModel.js';
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
import { OAuth2Client } from 'google-auth-library';
import slugify from 'slugify';

const generateUsername = (baseName, count) => {
  const slug = slugify(baseName, { lower: true, strict: true });
  return count > 0 ? `${slug}${count}` : slug;
};

const signup = async (req, res) => {
  const fields = validate(signupSchema, req.body);
  const errors = {};

  const user = await User.findOne({
    $or: [{ username: fields.username }, { email: fields.email }],
  }).select('username email');

  if (user) {
    if (user.username === fields.username)
      errors.username = 'Username already in use';
    if (user.email === fields.email) errors.email = 'Email already in use';

    throw new ResponseError('Validation errors', 400, errors);
  }

  const userRole = await Role.findOne({ name: 'user' });
  fields.password = await bcrypt.hash(fields.password, 10);

  const newUser = await User.create({
    ...fields,
    verificationToken: crypto.randomBytes(32).toString('hex'),
    verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    role: userRole._id,
  });

  const html = await ejs.renderFile('./src/views/verifyEmail.ejs', {
    username: newUser.username,
    url: `${process.env.CLIENT_URL}/verify-email/${newUser.verificationToken}`,
  });

  await sendMail(newUser.email, 'Verify Email', html);

  logger.info('verification email sent successfully');
  res.status(200).json({
    code: 200,
    message: 'Please check your email to verify your account',
  });
};

const verifyEmail = async (req, res) => {
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
    throw new ResponseError(
      'Verification token is invalid or has expired',
      401
    );
  }

  logger.info('email verified successfully');
  res.status(200).json({
    code: 200,
    message: 'Email verified successfully',
  });
};

const resendVerification = async (req, res) => {
  const fields = validate(verifyEmailSchema, req.body);

  const user = await User.findOneAndUpdate(
    {
      email: fields.email,
      isVerified: false,
    },
    {
      verificationToken: crypto.randomBytes(32).toString('hex'),
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    { new: true }
  );

  if (!user) {
    throw new ResponseError('Validation errors', 400, {
      email: 'Email is not registered',
    });
  }

  const html = await ejs.renderFile('./src/views/verifyEmail.ejs', {
    username: user.username,
    url: `${process.env.CLIENT_URL}/verify-email/${user.verificationToken}`,
  });

  await sendMail(user.email, 'Verify Email', html);
  logger.info('verification email sent successfully');

  res.status(200).json({
    code: 200,
    message: 'Please check your email to verify your account',
  });
};

const signin = async (req, res) => {
  const fields = validate(signinSchema, req.body);

  const user = await User.findOne({
    email: fields.email,
    isVerified: true,
  }).populate('role');

  if (!user || !(await bcrypt.compare(fields.password, user.password)))
    throw new ResponseError('Email or password is invalid', 401);

  const payload = { sub: user._id, role: user.role.name };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES,
  });
  const decodedRefreshToken = jwt.decode(refreshToken);

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: new Date(decodedRefreshToken.exp * 1000),
  });

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
        id: transformedUser._id,
        username: transformedUser.username,
        email: transformedUser.email,
        avatar: transformedUser.avatar,
        role: transformedUser.role.name,
        token,
      },
    });
};

const googleSignin = async (req, res) => {
  if (!req.body.code) {
    throw new ResponseError('Authorization code is not provided', 401);
  }

  const client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  });

  const { tokens } = await client.getToken(req.body.code);
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { email, name } = ticket.getPayload();
  let user = await User.findOne({ 
    email,
    isVerified: true
  });

  if (!user) {
    let baseUsername = name;
    let count = 0;
    let username;
    let isUsernameTaken = true;

    while (isUsernameTaken) {
      username = generateUsername(baseUsername, count);
      const existing = await User.findOne({ username });
      if (!existing) isUsernameTaken = false;
      count++;
    }

    const userRole = await Role.findOne({ name: 'user' });

    user = await User.create({
      email,
      username,
      avatar: process.env.DEFAULT_AVATAR_URL,
      role: userRole._id,
      isVerified: true,
    });
  }

  await user.populate('role');

  const payload = { sub: user._id, role: user.role.name };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES,
  });
  const decodedRefreshToken = jwt.decode(refreshToken);

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: new Date(decodedRefreshToken.exp * 1000),
  });

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
        id: transformedUser._id,
        username: transformedUser.username,
        email: transformedUser.email,
        avatar: transformedUser.avatar,
        role: transformedUser.role.name,
        token,
      },
    });
};

const signout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new ResponseError('Refresh token is not provided', 401);
  }

  const deletedToken = await RefreshToken.findOneAndDelete({
    token: refreshToken,
  });

  if (!deletedToken) throw new ResponseError('Refresh token is invalid', 401);

  logger.info('signed out successfully');
  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    throw new ResponseError('Refresh token is not provided', 401);

  const storedToken = await RefreshToken.findOne({
    token: refreshToken,
    expiresAt: { $gt: Date.now() },
  }).populate({
    path: 'user',
    populate: { path: 'role' },
  });

  if (!storedToken) throw new ResponseError('Refresh token is invalid', 401);

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError')
        throw new ResponseError('Refresh token has expired', 401);

      throw new ResponseError('Refresh token is invalid', 401);
    }
  });

  const newToken = jwt.sign(
    { sub: storedToken.user._id, role: storedToken.user.role.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES }
  );

  logger.info('token refreshed successfully');
  res.status(200).json({
    code: 200,
    message: 'Token refreshed successfully',
    data: { token: newToken },
  });
};

const requestResetPassword = async (req, res) => {
  const fields = validate(verifyEmailSchema, req.body);

  const user = await User.findOneAndUpdate(
    {
      email: fields.email,
      isVerified: true,
    },
    {
      resetToken: crypto.randomBytes(32).toString('hex'),
      resetTokenExpires: new Date(Date.now() + 1 * 60 * 60 * 1000),
    },
    { new: true }
  );

  if (!user) {
    throw new ResponseError('Validation errors', 400, {
      email: 'Email is not registered',
    });
  }

  const html = await ejs.renderFile('./src/views/resetPassword.ejs', {
    username: user.username,
    url: `${process.env.CLIENT_URL}/reset-password/${user.resetToken}`,
  });

  await sendMail(user.email, 'Reset Password', html);

  logger.info('reset password email sent successfully');
  res.status(200).json({
    code: 200,
    message: 'Please check your email to reset your password',
  });
};

const resetPassword = async (req, res) => {
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

  if (!user)
    throw new ResponseError('Reset token is invalid or has expired', 401);

  logger.info('password reset successfully');
  res.status(200).json({
    code: 200,
    message: 'Password reset successfully',
  });
};

export default {
  signup,
  googleSignin,
  signin,
  signout,
  refreshToken,
  requestResetPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};
