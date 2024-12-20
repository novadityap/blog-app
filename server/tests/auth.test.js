import request from 'supertest';
import app from '../src/app.js';
import { findLog, createTestUser, removeTestUser } from './testUtil.js';
import Blacklist from '../src/models/blacklistModel.js';
import jwt from 'jsonwebtoken';

describe('POST /api/auth/signup', () => {
  let startTime;

  beforeEach(async () => {
    startTime = new Date();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it('should return an error if invalid input data', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      username: '',
      email: '',
      password: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.username).toBeDefined();
    expect(res.body.errors.email).toBeDefined();
    expect(res.body.errors.password).toBeDefined();
  });

  it('should not create a new user if email already in use', async () => {
    await createTestUser();

    const res = await request(app).post('/api/auth/signup').send({
      username: 'test',
      email: 'test@me.com',
      password: 'test123',
    });

    const logMessage = 'user already exists';
    const relevantLog = await findLog(logMessage, startTime);

    expect(res.status).toBe(200);
    expect(relevantLog).toBeDefined();
  });

  it('should create a new user and send verification email', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      username: 'test',
      email: 'test@me.com',
      password: 'test123',
    });

    const logMessage = 'verification email sent successfully';
    const relevantLog = await findLog(logMessage, startTime);

    expect(res.status).toBe(200);
    expect(relevantLog).toBeDefined();
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

    const res = await request(app).post(
      `/api/auth/verify-email/${user.verificationToken}`
    );

    expect(res.status).toBe(401);
    expect(res.body.message).toBe(
      'Verification token is invalid or has expired'
    );
  });

  it('should verify email if verification token is valid', async () => {
    const { verificationToken } = user;
    const res = await request(app).post(
      `/api/auth/verify-email/${verificationToken}`
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Email verified successfully');
  });
});

describe('POST /api/auth/resend-verification', () => {
  let startTime;

  beforeEach(async () => {
    startTime = new Date();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it('should return an error if input data is invalid', async () => {
    const res = await request(app).post('/api/auth/resend-verification').send({
      email: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.errors.email).toBeDefined();
  });

  it('should not send verification email if user is not registered', async () => {
    const res = await request(app).post('/api/auth/resend-verification').send({
      email: 'test@me.com',
    });

    const logMessage = 'user is not registered';
    const relevantLog = await findLog(logMessage, startTime);

    expect(res.status).toBe(200);
    expect(relevantLog).toBeDefined();
  });

  it('should send verification email if user is registered', async () => {
    await createTestUser();

    const res = await request(app).post('/api/auth/resend-verification').send({
      email: 'test@me.com',
    });

    const logMessage = 'verification email sent successfully';
    const relevantLog = await findLog(logMessage, startTime);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      'Please check your email to verify your account'
    );
    expect(relevantLog).toBeDefined();
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
    const res = await request(app).post('/api/auth/signin').send({
      email: '',
      password: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.errors.email).toBeDefined();
    expect(res.body.errors.password).toBeDefined();
  });

  it('should return an error if credentials are invalid', async () => {
    const res = await request(app).post('/api/auth/signin').send({
      email: 'test@me.co',
      password: 'test12',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Email or password is invalid');
  });

  it('should sign in if credentials are valid', async () => {
    const res = await request(app).post('/api/auth/signin').send({
      email: 'test@me.com',
      password: 'test123',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.username).toBeDefined();
    expect(res.body.data.email).toBeDefined();
    expect(res.body.data.roles).toBeDefined();

    const decoded = jwt.verify(res.body.data.token, process.env.JWT_SECRET);
    expect(decoded.id).toBeDefined();
    expect(decoded.roles).toBeDefined();

    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=/);
  });
});

describe('POST /api/auth/signout', () => {
  afterEach(async () => {
    await removeTestUser();
    Blacklist.deleteMany();
  });

  it('should return an error if refresh token is not provided', async () => {
    const res = await request(app)
      .post('/api/auth/signout')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Refresh token is not provided');
  });

  it('should return an error if refresh token is not found in the database', async () => {
    const res = await request(app)
      .post('/api/auth/signout')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Cookie', `refreshToken=${global.adminRefreshToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Refresh token is invalid');
  });

  it('should sign out if refresh token is valid', async () => {
    const user = await createTestUser();
    user.refreshToken = global.adminRefreshToken;
    await user.save();

    const res = await request(app)
      .post('/api/auth/signout')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Cookie', `refreshToken=${global.adminRefreshToken}`);

    expect(res.status).toBe(204);
  });
});

describe('POST /api/auth/refresh-token', () => {
  afterEach(async () => {
    await Blacklist.deleteMany();
    await removeTestUser();
  });

  it('should return an error if refresh token is not provided', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Refresh token is not provided');
  });

  it('should return an error if refresh token is blacklisted', async () => {
    await Blacklist.create({ token: global.adminRefreshToken });

    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Cookie', `refreshToken=${global.adminRefreshToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Refresh token is invalid');
  });

  it('should return an error if refresh token is not found in the database', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Cookie', `refreshToken=${global.adminRefreshToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Refresh token is invalid');
  });

  it('should refresh token if refresh token is valid', async () => {
    const user = await createTestUser();
    user.refreshToken = global.adminRefreshToken;
    await user.save();

    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Cookie', `refreshToken=${global.adminRefreshToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Token refreshed successfully');

    const decoded = jwt.verify(res.body.data.token, process.env.JWT_SECRET);
    expect(decoded.id).toBeDefined();
    expect(decoded.roles).toBeDefined();
  });
});

describe('POST /api/auth/request-reset-password', () => {
  afterEach(async () => {
    await removeTestUser();
  });

  it('should return an error if input data is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/request-reset-password')
      .send({
        email: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors.email).toBeDefined();
  });

  it('should not send reset password email if user is not registered', async () => {
    const res = await request(app)
      .post('/api/auth/request-reset-password')
      .send({
        email: 'test1@me.com',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      'Please check your email to reset your password'
    );
  });

  it('should send reset password email if user is registered', async () => {
    const user = await createTestUser();
    user.isVerified = true;
    await user.save();

    const res = await request(app)
      .post('/api/auth/request-reset-password')
      .send({
        email: 'test@me.com',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
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
    const res = await request(app)
      .post('/api/auth/reset-password/invalid-token')
      .send({
        newPassword: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors.newPassword).toBeDefined();
  });

  it('should return an error if reset token has expired', async () => {
    user.resetTokenExpires = Date.now() - 1000;
    await user.save();

    const res = await request(app).post('/api/auth/reset-password/123').send({
      newPassword: 'test123',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Reset token is invalid or has expired');
  });

  it('should reset password if reset token is valid', async () => {
    user.resetTokenExpires = Date.now() + 1 * 60 * 60 * 1000;
    await user.save();

    const res = await request(app).post(`/api/auth/reset-password/123`).send({
      newPassword: 'test123',
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Password reset successfully');
  });
});
