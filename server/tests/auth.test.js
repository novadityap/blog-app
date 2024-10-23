import request from 'supertest';
import app from '../src/app.js';
import {
  findRelevantLog,
  createTestUser,
  removeTestUser,
  createAuthToken,
} from './testUtil.js';
import connectDB from '../src/config/connection.js';
import mongoose from 'mongoose';
import Blacklist from '../src/models/blacklistModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const token = createAuthToken('auth');
const refreshToken = createAuthToken('refresh');

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /api/auth/signup', () => {
  let startTime;

  beforeEach(async () => {
    startTime = new Date();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it('should return 400 for invalid input', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      username: '',
      email: '',
      password: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toMatchObject({
      username: expect.anything(),
      email: expect.anything(),
      password: expect.anything(),
    });
  });

  it('should create a new user and send email verification', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      username: 'test',
      email: 'test@me.com',
      password: 'test123',
    });

    const logMessage = 'signup - email has been sent to test@me.com';
    const relevantLog = await findRelevantLog(logMessage, startTime);

    expect(res.status).toBe(200);
    expect(relevantLog).toBeDefined();
  });

  it('should skip sending email verification if user already exists', async () => {
    await createTestUser();
    const res = await request(app).post('/api/auth/signup').send({
      username: 'test',
      email: 'test@me.com',
      password: 'test123',
    });

    const logMessage = 'signup - user already exists with email test@me.com';
    const relevantLog = await findRelevantLog(logMessage, startTime);

    expect(res.status).toBe(200);
    expect(relevantLog).toBeDefined();
  });
});

describe('POST /api/auth/email-verification/:token', () => {
  let user;

  beforeEach(async () => {
    user = await createTestUser();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it('should return 400 for invalid token', async () => {
    const res = await request(app).post(
      `/api/auth/email-verification/invalid-token`
    );

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid verification token');
  });

  it('should return 401 for expired token', async () => {
    user.verificationTokenExpires = new Date() - 24 * 60 * 60 * 1000;
    await user.save();

    const res = await request(app).post(
      `/api/auth/email-verification/${user.verificationToken}`
    );

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid verification token');
  });

  it('should verify the email and return 200', async () => {
    const { verificationToken } = user;
    const res = await request(app).post(
      `/api/auth/email-verification/${verificationToken}`
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Email has been verified, you can now login');
  });
});

describe('POST /api/auth/resend-email-verification', () => {
  let startTime;

  beforeEach(async () => {
    startTime = new Date();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it('should return 400 for invalid input', async () => {
    const res = await request(app)
      .post('/api/auth/resend-email-verification')
      .send({
        email: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors.email).toBeDefined();
  });

  it('should skip sending email verification for unregistered user', async () => {
    const res = await request(app)
      .post('/api/auth/resend-email-verification')
      .send({
        email: 'test@me.com',
      });

    const logMessage = 'resend email verification - user is not registered with email test@me.com';
    const relevantLog = await findRelevantLog(logMessage, startTime);

    expect(res.status).toBe(200);
    expect(relevantLog).toBeDefined();
  });

  it('should return 200 and resend email verification', async () => {
    await createTestUser();

    const res = await request(app)
      .post('/api/auth/resend-email-verification')
      .send({
        email: 'test@me.com',
      });

      const logMessage = 'resend email verification - email has been sent to test@me.com';
      const relevantLog = await findRelevantLog(logMessage, startTime);

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
    user.password = await bcrypt.hash('test123', 10);
    await user.save();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it('should return 400 for invalid input', async () => {
    const res = await request(app).post('/api/auth/signin').send({
      email: '',
      password: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toMatchObject({
      email: expect.anything(),
      password: expect.anything(),
    });
  });

  it('should return 401 for invalid credentials', async () => {
    const res = await request(app).post('/api/auth/signin').send({
      email: 'test@me.co',
      password: 'test12',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should return 200 and set a valid JWT token and refresh token in the cookie for valid credentials', async () => {
    const res = await request(app).post('/api/auth/signin').send({
      email: 'test@me.com',
      password: 'test123',
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('username');
    expect(res.body.data).toHaveProperty('email');
    expect(res.body.data).toHaveProperty('avatar');

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
  });

  it('should return 401 for refresh token not provided', async () => {
    const res = await request(app)
      .post('/api/auth/signout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid refresh token');
  });

  it('should return 401 for refresh token not found in database', async () => {
    const startTime = new Date();
    const res = await request(app)
      .post('/api/auth/signout')
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', `refreshToken=${refreshToken}`);

      const logMessage = 'signout - refresh token not found in database';
      const relevantLog = await findRelevantLog(logMessage, startTime);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid refresh token');
    expect(relevantLog).toBeDefined();
  });

  it('should return 204 for valid refresh token', async () => {
    const user = await createTestUser();
    user.refreshToken = refreshToken;
    await user.save();

    const res = await request(app)
      .post('/api/auth/signout')
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(res.status).toBe(204);
  });
});

describe('POST /api/auth/refresh-token', () => {
  afterEach(async () => {
    await Blacklist.deleteMany({});
    await removeTestUser();
  });

  it('should return 401 for invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid refresh token');
  });

  it('should return 401 for blacklisted refresh token', async () => {
    await Blacklist.create({ token: refreshToken });
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid refresh token');
  });

  it('should return 401 for refresh token not found in database', async () => {
    const startTime = new Date();
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', `refreshToken=${refreshToken}`);

    const logMessage = 'refresh token - refresh token not found in database';
    const relevantLog = await findRelevantLog(logMessage, startTime);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid refresh token');
    expect(relevantLog).toBeDefined();
  });

  it('should return 200 for valid refresh token and new token', async () => {
    const user = await createTestUser();
    user.refreshToken = refreshToken;
    await user.save();

    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', `refreshToken=${refreshToken}`);

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

  it('should return 400 for invalid input', async () => {
    const res = await request(app)
      .post('/api/auth/request-reset-password')
      .send({
        email: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors.email).toBeDefined();
  });

  it('should return 200 and skip sending email for unregistered user', async () => {
    const startTime = new Date();
    const res = await request(app)
      .post('/api/auth/request-reset-password')
      .send({
        email: 'test1@me.com',
      });

      const logMessage =  'request reset password - user is not registered';
    const relevantLog = await findRelevantLog(logMessage, startTime);

    expect(res.status).toBe(200);
    expect(relevantLog).toBeDefined();
  });

  it('should return 200 and sending email for registered user', async () => {
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
    user.resetTokenExpires = Date.now() + 1 * 60 * 60 * 1000;
    await user.save();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it('should return 400 for invalid input', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password/invalid-token')
      .send({
        newPassword: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors.newPassword).toBeDefined();
  });

  it('should return 401 for invalid token', async () => {
    const res = await request(app).post('/api/auth/reset-password/1234').send({
      newPassword: 'test123',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid reset token');
  });

  it('should return 401 for expired token', async () => {
    user.resetTokenExpires = Date.now() - 1 * 60 * 60 * 1000;
    await user.save();

    const res = await request(app).post('/api/auth/reset-password/123').send({
      newPassword: 'test123',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid reset token');
  });

  it('should return 200 for valid token', async () => {
    user.resetTokenExpires = Date.now() + 1 * 60 * 60 * 1000;
    await user.save();

    const res = await request(app).post(`/api/auth/reset-password/123`).send({
      newPassword: 'test123',
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      'Password has been reset successfully, please login with your new password'
    );
  });
});
