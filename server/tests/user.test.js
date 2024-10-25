import request from 'supertest';
import app from '../src/app.js';
import connectDB from '../src/config/connection.js';
import mongoose from 'mongoose';
import path from 'node:path';
import * as fs from 'node:fs/promises';
import Role from '../src/models/roleModel.js';
import Permission from '../src/models/permissionModel.js';
import seedRole from '../src/seeders/roleSeeder.js';
import seedPermission from '../src/seeders/permissionSeeder.js';
import {
  createTestUser,
  createManyTestUsers,
  getTestUser,
  createAuthToken,
  removeTestUser,
  removeAllTestUsers,
  fileExists,
  copyFile,
} from './testUtil.js';

let adminRole;
const token = createAuthToken('auth');
const invalidId = undefined;
const missingId = new mongoose.Types.ObjectId();
const testAvatarPath = path.join(
  process.cwd(),
  'tests/uploads/avatars',
  'test-avatar.jpg'
);
const cases = [
  {
    name: 'invalid user id',
    id: invalidId,
    expectedStatus: 400,
    expectedMessage: 'Invalid id',
  },
  {
    name: 'missing user id',
    id: missingId,
    expectedStatus: 404,
    expectedMessage: 'User not found',
  },
];

beforeAll(async () => {
  await connectDB();
  await seedPermission();
  await seedRole();
  adminRole = await Role.findOne({ name: 'admin' });
});

afterAll(async () => {
  await Role.deleteMany({});
  await Permission.deleteMany({});
  await mongoose.connection.close();
});

describe('GET /api/users', () => {
  beforeEach(async () => {
    await createManyTestUsers(3);
  });

  afterEach(async () => {
    await removeTestUser();
    await removeAllTestUsers();
  });

  it('should return 200 and fetch all users without search query', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .query({
        page: 1,
        limit: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Users found');
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.pageSize).toBe(2);
    expect(res.body.meta.currentPage).toBe(1);
  });

  it('should return 200 and fetch users with search query matching username', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .query({
        limit: 10,
        page: 1,
        search: 'test1',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(200);
    expect(res.body.message).toBe('Users found');
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 200 and empty data when no user matches the search query', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .query({
        limit: 10,
        page: 1,
        search: 'notexist',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('No users found');
    expect(res.body.data).toHaveLength(0);
  });
});

describe('GET /api/users/:id', () => {
  afterEach(async () => {
    await removeTestUser();
  });

  it.each(cases)(
    'should return $expectedStatus for user with $name',
    async ({ id, expectedStatus, expectedMessage }) => {
      const res = await request(app)
        .get(`/api/users/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(expectedStatus);
      expect(res.body.message).toBe(expectedMessage);
    }
  );

  it('should return 200 and user for valid id', async () => {
    const user = await createTestUser();
    const res = await request(app)
      .get(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User found');
    expect(res.body.data).toBeDefined();
  });
});

describe('POST /api/users', () => {
  afterEach(async () => {
    await removeTestUser();
  });

  it('should return 400 for invalid input', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.username).toBeDefined();
    expect(res.body.errors.email).toBeDefined();
    expect(res.body.errors.password).toBeDefined();
  });

  it('should return 409 for duplicate email', async () => {
    const user = await createTestUser();
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'test',
        email: user.email,
        password: 'test123',
        roles: [adminRole._id],
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Email already in use');
  });

  it('should return 400 for invalid roles input', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'test',
        email: 'test@me.com',
        password: 'test123',
        roles: ['invalid'],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.roles).toBeDefined();
  });

  it('should return 201 and created user for valid input', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'test',
        email: 'test@me.com',
        password: 'test123',
        roles: [adminRole._id],
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User created successfully');
  });
});

describe('PATCH /api/users/:id', () => {
  let user;

  beforeEach(async () => {
    user = await createTestUser();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it.each(cases)(
    'should return $expectedStatus for user with $name',
    async ({ id, expectedStatus, expectedMessage }) => {
      const res = await request(app)
        .get(`/api/users/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(expectedStatus);
      expect(res.body.message).toBe(expectedMessage);
    }
  );

  it('should return 200 and updated user without changing avatar file', async () => {
    const res = await request(app)
      .patch(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data')
      .field('email', 'test1@me.com');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User updated successfully');
  });

  it('should return 200 and updated user with changing avatar file', async () => {
    const res = await request(app)
      .patch(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data')
      .field('email', 'test1@me.com')
      .attach('avatar', testAvatarPath);

    const updatedUser = await getTestUser();
    const avatarExists = await fileExists('avatars', updatedUser.avatar);

    expect(avatarExists).toBe(true);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User updated successfully');

    await fs.unlink(
      path.join(
        process.cwd(),
        process.env.AVATAR_UPLOADS_DIR,
        updatedUser.avatar
      )
    );
  });

  it('should return 200 and update user by changing avatar file and removing old non-default avatar', async () => {
    user.avatar = 'test-avatar.jpg';
    await user.save();
    await copyFile(testAvatarPath, 'avatars');

    const res = await request(app)
      .patch(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data')
      .field('email', 'test1@me.com')
      .attach('avatar', testAvatarPath);

    const updatedUser = await getTestUser();
    const oldAvatarExists = await fileExists('avatars', 'test-avatar.jpg');
    const avatarExists = await fileExists('avatars', updatedUser.avatar);

    expect(oldAvatarExists).toBe(false);
    expect(avatarExists).toBe(true);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User updated successfully');

    await fs.unlink(
      path.join(
        process.cwd(),
        process.env.AVATAR_UPLOADS_DIR,
        updatedUser.avatar
      )
    );
  });
});

describe('DELETE /api/users/:id', () => {
  let user;

  beforeEach(async () => {
    user = await createTestUser();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it.each(cases)(
    'should return $expectedStatus for user with $name',
    async ({ id, expectedStatus, expectedMessage }) => {
      const res = await request(app)
        .get(`/api/users/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(expectedStatus);
      expect(res.body.message).toBe(expectedMessage);
    }
  );

  it('should return 200 and deleted user without removing default avatar file', async () => {
    const res = await request(app)
      .delete(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`);

    const avatarExists = await fileExists('avatars', 'default.jpg');

    expect(avatarExists).toBe(true);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User deleted successfully');
  });

  it('should return 200 and deleted user with removing avatar file', async () => {
    user.avatar = 'test-avatar.jpg';
    user.save();
    await copyFile(testAvatarPath, 'avatars');

    const res = await request(app)
      .delete(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`);

    const avatarExists = await fileExists('avatars', 'test-avatar.jpg');

    expect(avatarExists).toBe(false);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User deleted successfully');
  });
});
