import request from 'supertest';
import app from '../src/app.js';
import path from 'node:path';
import User from '../src/models/userModel.js';
import { access, copyFile } from 'node:fs/promises';
import Role from '../src/models/roleModel.js';
import {
  createTestUser,
  createManyTestUsers,
  removeTestUser,
  removeTestFile,
} from './testUtil.js';

const testAvatarPath = path.resolve(
  process.env.AVATAR_DIR_TEST,
  'test-avatar.jpg'
);

describe('GET /api/users/search', () => {
  beforeEach(async () => {
    await createManyTestUsers();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it('should return an error if user does not have permission', async () => {
    const result = await request(app)
      .get('/api/users/search')
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return a list of users with default pagination', async () => {
    const result = await request(app)
      .get('/api/users/search')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Users retrieved successfully');
    expect(result.body.data).toHaveLength(10);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBe(15);
    expect(result.body.meta.currentPage).toBe(1);
    expect(result.body.meta.totalPages).toBe(2);
  });

  it('should return a list of users with custom pagination', async () => {
    const result = await request(app)
      .get('/api/users/search')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        page: 2,
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Users retrieved successfully');
    expect(result.body.data.length).toBe(5);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBe(15);
    expect(result.body.meta.currentPage).toBe(2);
    expect(result.body.meta.totalPages).toBe(2);
  });

  it('should return a list of users with custom search', async () => {
    const result = await request(app)
      .get('/api/users/search')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        q: 'test10',
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Users retrieved successfully');
    expect(result.body.data).toHaveLength(1);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBe(1);
    expect(result.body.meta.currentPage).toBe(1);
    expect(result.body.meta.totalPages).toBe(1);
  });
});

describe('GET /api/users/:userId', () => {
  it('should return an error if user is not owned by current user', async () => {
    const user = await createTestUser();
    const result = await request(app)
      .get(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');

    await removeTestUser();
  });

  it('should return an error if user id is invalid', async () => {
    const result = await request(app)
      .get('/api/users/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.userId).toBeDefined();
  });

  it('should return an error if user is not found', async () => {
    const result = await request(app)
      .get(`/api/users/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('User not found');
  });

  it('should return a user for user id is valid', async () => {
    const user = await createTestUser();
    const result = await request(app)
      .get(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('User retrieved successfully');
    expect(result.body.data).toBeDefined();

    await removeTestUser();
  });
});

describe('POST /api/users', () => {
  let adminRole;

  beforeEach(async () => {
    adminRole = await Role.findOne({ name: 'admin' });
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it('should return an error if user does not have permission', async () => {
    const result = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if input data is invalid', async () => {
    const result = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        username: '',
        email: '',
        password: '',
        role: '',
      });

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.username).toBeDefined();
    expect(result.body.errors.email).toBeDefined();
    expect(result.body.errors.password).toBeDefined();
    expect(result.body.errors.role).toBeDefined();
  });

  it('should return an error if email already in use', async () => {
    await createTestUser();

    const result = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        username: 'test1',
        email: 'test@me.com',
        password: 'test123',
        role: adminRole._id,
      });

    expect(result.status).toBe(409);
    expect(result.body.message).toBe('Resource already in use');
    expect(result.body.errors.email).toBeDefined();
  });

  it('should return an error if username already in use', async () => {
    await createTestUser();

    const result = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        username: 'test',
        email: 'test1@me.com',
        password: 'test123',
        role: adminRole._id,
      });

    expect(result.status).toBe(409);
    expect(result.body.message).toBe('Resource already in use');
    expect(result.body.errors.username).toBeDefined();
  });

  it('should return an error if role is invalid', async () => {
    const result = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        username: 'test',
        email: 'test@me.com',
        password: 'test123',
        role: 'invalid-id',
      });

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.role).toBeDefined();
  });

  it('should create a user if input data is valid', async () => {
    const result = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        username: 'test',
        email: 'test@me.com',
        password: 'test123',
        role: adminRole._id,
      });

    expect(result.status).toBe(201);
    expect(result.body.message).toBe('User created successfully');
  });
});

describe('PUT /api/users/:userId', () => {
  let user;
  let adminRole;

  beforeEach(async () => {
    adminRole = await Role.findOne({ name: 'admin' });
    user = await createTestUser();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it('should return an error if user is not owned by current user', async () => {
    const result = await request(app)
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if user id is invalid', async () => {
    const result = await request(app)
      .put('/api/users/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.userId).toBeDefined();
  });

  it('should return an error if user is not found', async () => {
    const result = await request(app)
      .put(`/api/users/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('User not found');
  });

  it('should return an error if input data is invalid', async () => {
    const result = await request(app)
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('email', '')
      .field('username', '');

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.username).toBeDefined();
    expect(result.body.errors.email).toBeDefined();
  });

  it('should return an error if role is invalid', async () => {
    const result = await request(app)
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('email', 'test1@me.com')
      .field('username', 'test1')
      .field('role', 'invalid-id');

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.role).toBeDefined();
  });

  it('should return an error if email is already in use', async () => {
    await createTestUser({ email: 'test1@me.com' });

    const result = await request(app)
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('email', 'test1@me.com')
      .field('username', 'test1')
      .field('role', adminRole._id.toString());

    expect(result.status).toBe(409);
    expect(result.body.message).toBe('Resource already in use');
    expect(result.body.errors.email).toBeDefined();
  });

  it('should return an error if username is already in use', async () => {
    await createTestUser({ username: 'test1' });

    const result = await request(app)
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('email', 'test1@me.com')
      .field('username', 'test1')
      .field('role', adminRole._id.toString());

    expect(result.status).toBe(409);
    expect(result.body.message).toBe('Resource already in use');
    expect(result.body.errors.username).toBeDefined();
  });

  it('should update user without changing avatar', async () => {
    const result = await request(app)
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('email', 'test1@me.com')
      .field('username', 'test1')
      .field('role', adminRole._id.toString());

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('User updated successfully');
    expect(result.body.data.email).toBe('test1@me.com');
    expect(result.body.data.username).toBe('test1');
    expect(result.body.data.role).toBe(adminRole._id.toString());
  });

  it('should update user with changing avatar', async () => {
    const result = await request(app)
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('email', 'test1@me.com')
      .field('username', 'test1')
      .attach('avatar', testAvatarPath);

    const updatedUser = await User.findById(user._id);
    const avatarExists = await access(
      path.resolve(process.env.AVATAR_DIR, updatedUser.avatar)
    )
      .then(() => true)
      .catch(() => false);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('User updated successfully');
    expect(result.body.data.email).toBe('test1@me.com');
    expect(result.body.data.username).toBe('test1');
    expect(avatarExists).toBe(true);

    await removeTestFile('avatar');
  });
});

describe('DELETE /api/users/:userId', () => {
  let user;

  beforeEach(async () => {
    user = await createTestUser();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it('should return an error if user is not owned by current user', async () => {
    const result = await request(app)
      .delete(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if user id is invalid', async () => {
    const result = await request(app)
      .delete('/api/users/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.userId).toBeDefined();
  });

  it('should return an error if user is not found', async () => {
    const result = await request(app)
      .delete(`/api/users/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('User not found');
  });

  it('should delete user without removing default avatar', async () => {
    const result = await request(app)
      .delete(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    const avatarExists = await access(
      path.resolve(process.env.AVATAR_DIR, 'default.jpg')
    )
      .then(() => true)
      .catch(() => false);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('User deleted successfully');
    expect(avatarExists).toBe(true);
  });

  it('should delete user with removing non-default avatar', async () => {
    const avatarPath = path.resolve(process.env.AVATAR_DIR, 'test-avatar.jpg');
    user.avatar = 'test-avatar.jpg';

    await user.save();
    await copyFile(testAvatarPath, avatarPath);

    const result = await request(app)
      .delete(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    const avatarExists = await access(avatarPath)
      .then(() => true)
      .catch(() => false);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('User deleted successfully');
    expect(avatarExists).toBe(false);
  });
});
