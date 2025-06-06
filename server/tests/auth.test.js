jest.mock('../src/utils/sendMail.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import request from 'supertest';
import app from '../src/app.js';
import { createTestUser, removeTestUser } from './testUtil.js';
import Blacklist from '../src/models/blacklistModel.js';
import jwt from 'jsonwebtoken';
import sendMail from '../src/utils/sendMail.js';

describe('POST /api/auth/signup', () => {
  afterEach(async () => {
    sendMail.mockClear();
    await removeTestUser();
  });

  it('should return an error if invalid input data', async () => {
    const result = await request(app).post('/api/auth/signup').send({
      username: '',
      email: '',
      password: '',
    });

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.username).toBeDefined();
    expect(result.body.errors.email).toBeDefined();
    expect(result.body.errors.password).toBeDefined();
  });

  it('should not create a new user if email already in use', async () => {
    await createTestUser();

    const result = await request(app).post('/api/auth/signup').send({
      username: 'test',
      email: 'test@me.com',
      password: 'test123',
    });

    expect(result.status).toBe(200);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('should create a new user and send verification email', async () => {
    const result = await request(app).post('/api/auth/signup').send({
      username: 'test',
      email: 'test@me.com',
      password: 'test123',
    });

    expect(result.status).toBe(200);
    expect(sendMail).toHaveBeenCalledTimes(1);
  });
});

describe('POST /api/auth/verify-email/:token', () => {
  let user;

  beforeEach(async () => {
    user = await createTestUser();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it('should return an error if verification token has expired', async () => {
    user.verificationTokenExpires = new Date() - 1000;
    await user.save();

    const result = await request(app).post(
      `/api/auth/verify-email/${user.verificationToken}`
    );

    expect(result.status).toBe(401);
    expect(result.body.message).toBe(
      'Verification token is invalid or has expired'
    );
  });

  it('should verify email if verification token is valid', async () => {
    const { verificationToken } = user;
    const result = await request(app).post(
      `/api/auth/verify-email/${verificationToken}`
    );

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Email verified successfully');
  });
});

describe('POST /api/auth/resend-verification', () => {
  afterEach(async () => {
    sendMail.mockClear();
    await removeTestUser();
  });

  it('should return an error if input data is invalid', async () => {
    const result = await request(app)
      .post('/api/auth/resend-verification')
      .send({
        email: '',
      });

    expect(result.status).toBe(400);
    expect(result.body.errors.email).toBeDefined();
  });

  it('should not send verification email if user is not registered', async () => {
    const result = await request(app)
      .post('/api/auth/resend-verification')
      .send({
        email: 'test@me.com',
      });

    expect(result.status).toBe(200);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('should send verification email if user is registered', async () => {
    await createTestUser();

    const result = await request(app)
      .post('/api/auth/resend-verification')
      .send({
        email: 'test@me.com',
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe(
      'Please check your email to verify your account'
    );
    expect(sendMail).toHaveBeenCalledTimes(1);
  });
});

describe('POST /api/auth/signin', () => {
  let user;

  beforeEach(async () => {
    user = await createTestUser();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it('should return an error if input data is invalid', async () => {
    const result = await request(app).post('/api/auth/signin').send({
      email: '',
      password: '',
    });

    expect(result.status).toBe(400);
    expect(result.body.errors.email).toBeDefined();
    expect(result.body.errors.password).toBeDefined();
  });

  it('should return an error if credentials are invalid', async () => {
    const result = await request(app).post('/api/auth/signin').send({
      email: 'test@me.co',
      password: 'test12',
    });

    expect(result.status).toBe(401);
    expect(result.body.message).toBe('Email or password is invalid');
  });

  it('should sign in if credentials are valid', async () => {
    const result = await request(app).post('/api/auth/signin').send({
      email: 'test@me.com',
      password: 'test123',
    });

    expect(result.status).toBe(200);
    expect(result.body.data.token).toBeDefined();
    expect(result.body.data.username).toBeDefined();
    expect(result.body.data.email).toBeDefined();
    expect(result.body.data.role).toBeDefined();

    const decoded = jwt.verify(result.body.data.token, process.env.JWT_SECRET);
    expect(decoded.id).toBeDefined();
    expect(decoded.role).toBeDefined();

    expect(result.headers['set-cookie']).toBeDefined();
    expect(result.headers['set-cookie'][0]).toMatch(/refreshToken=/);
  });
});

describe('POST /api/auth/signout', () => {
  afterEach(async () => {
    await removeTestUser();
    Blacklist.deleteMany();
  });

  it('should return an error if refresh token is not provided', async () => {
    const result = await request(app)
      .post('/api/auth/signout')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(401);
    expect(result.body.message).toBe('Refresh token is not provided');
  });

  it('should return an error if refresh token is not found in the database', async () => {
    const result = await request(app)
      .post('/api/auth/signout')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Cookie', `refreshToken=${global.adminRefreshToken}`);

    expect(result.status).toBe(401);
    expect(result.body.message).toBe('Refresh token is invalid');
  });

  it('should sign out if refresh token is valid', async () => {
    const user = await createTestUser();
    user.refreshToken = global.adminRefreshToken;
    await user.save();

    const result = await request(app)
      .post('/api/auth/signout')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Cookie', `refreshToken=${global.adminRefreshToken}`);

    expect(result.status).toBe(204);
  });
});

describe('POST /api/auth/refresh-token', () => {
  afterEach(async () => {
    await Blacklist.deleteMany();
    await removeTestUser();
  });

  it('should return an error if refresh token is not provided', async () => {
    const result = await request(app)
      .post('/api/auth/refresh-token')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(401);
    expect(result.body.message).toBe('Refresh token is not provided');
  });

  it('should return an error if refresh token is blacklisted', async () => {
    await Blacklist.create({ token: global.adminRefreshToken });

    const result = await request(app)
      .post('/api/auth/refresh-token')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Cookie', `refreshToken=${global.adminRefreshToken}`);

    expect(result.status).toBe(401);
    expect(result.body.message).toBe('Refresh token is invalid');
  });

  it('should return an error if refresh token is not found in the database', async () => {
    const result = await request(app)
      .post('/api/auth/refresh-token')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Cookie', `refreshToken=${global.adminRefreshToken}`);

    expect(result.status).toBe(401);
    expect(result.body.message).toBe('Refresh token is invalid');
  });

  it('should refresh token if refresh token is valid', async () => {
    const user = await createTestUser();
    user.refreshToken = global.adminRefreshToken;
    await user.save();

    const result = await request(app)
      .post('/api/auth/refresh-token')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Cookie', `refreshToken=${global.adminRefreshToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Token refreshed successfully');

    const decoded = jwt.verify(result.body.data.token, process.env.JWT_SECRET);
    expect(decoded.id).toBeDefined();
    expect(decoded.role).toBeDefined();
  });
});

describe('POST /api/auth/request-reset-password', () => {
  afterEach(async () => {
    await removeTestUser();
  });

  it('should return an error if input data is invalid', async () => {
    const result = await request(app)
      .post('/api/auth/request-reset-password')
      .send({
        email: '',
      });

    expect(result.status).toBe(400);
    expect(result.body.errors.email).toBeDefined();
  });

  it('should not send reset password email if user is not registered', async () => {
    const result = await request(app)
      .post('/api/auth/request-reset-password')
      .send({
        email: 'test1@me.com',
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe(
      'Please check your email to reset your password'
    );
  });

  it('should send reset password email if user is registered', async () => {
    const user = await createTestUser();
    user.isVerified = true;
    await user.save();

    const result = await request(app)
      .post('/api/auth/request-reset-password')
      .send({
        email: 'test@me.com',
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe(
      'Please check your email to reset your password'
    );
  });
});

describe('POST /api/auth/reset-password/:token', () => {
  let user;

  beforeEach(async () => {
    user = await createTestUser();
    user.resetToken = '123';
    user.resetTokenExpires = Date.now() + 1000;
    await user.save();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it('should return an error if input data is invalid', async () => {
    const result = await request(app)
      .post('/api/auth/reset-password/invalid-token')
      .send({
        newPassword: '',
      });

    expect(result.status).toBe(400);
    expect(result.body.errors.newPassword).toBeDefined();
  });

  it('should return an error if reset token has expired', async () => {
    user.resetTokenExpires = Date.now() - 1000;
    await user.save();

    const result = await request(app)
      .post('/api/auth/reset-password/123')
      .send({
        newPassword: 'test123',
      });

    expect(result.status).toBe(401);
    expect(result.body.message).toBe('Reset token is invalid or has expired');
  });

  it('should reset password if reset token is valid', async () => {
    user.resetTokenExpires = Date.now() + 1 * 60 * 60 * 1000;
    await user.save();

    const result = await request(app)
      .post(`/api/auth/reset-password/123`)
      .send({
        newPassword: 'test123',
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Password reset successfully');
  });
});
