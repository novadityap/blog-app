import request from 'supertest';
import app from '../src/app.js';
import path from 'node:path';
import User from '../src/models/userModel.js';
import { access, copyFile, unlink } from 'node:fs/promises';
import Role from '../src/models/roleModel.js';
import {
  createTestUser,
  createManyTestUsers,
  removeTestUser,
  removeTestFile,
} from './testUtil.js';

const testAvatarPath = path.resolve(
  process.env.TEST_AVATAR_DIR,
  'test-avatar.jpg'
);

describe('GET /api/users', () => {
  beforeEach(async () => {
    await createManyTestUsers();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it('should return an error if user does not have permission', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return a list of users with default pagination', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Users retrieved successfully');
    expect(res.body.data).toHaveLength(10);
    expect(res.body.meta.pageSize).toBe(10);
    expect(res.body.meta.totalItems).toBe(15);
    expect(res.body.meta.currentPage).toBe(1);
    expect(res.body.meta.totalPages).toBe(2);
  });

  it('should return a list of users with custom pagination', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        page: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Users retrieved successfully');
    expect(res.body.data.length).toBe(5);
    expect(res.body.meta.pageSize).toBe(10);
    expect(res.body.meta.totalItems).toBe(15);
    expect(res.body.meta.currentPage).toBe(2);
    expect(res.body.meta.totalPages).toBe(2);
  });

  it('should return a list of users with custom search', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        search: 'test10',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Users retrieved successfully');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.pageSize).toBe(10);
    expect(res.body.meta.totalItems).toBe(1);
    expect(res.body.meta.currentPage).toBe(1);
    expect(res.body.meta.totalPages).toBe(1);
  });
});

describe('GET /api/users/:userId', () => {
  it('should return an error if user is not owned by current user', async () => {
    const user = await createTestUser();
    const res = await request(app)
      .get(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');

    await removeTestUser();
  });

  it('should return an error if user id is invalid', async () => {
    const res = await request(app)
      .get('/api/users/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.userId).toBeDefined();
  });

  it('should return an error if user is not found', async () => {
    const res = await request(app)
      .get(`/api/users/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('should return a user for user id is valid', async () => {
    const user = await createTestUser();
    const res = await request(app)
      .get(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User retrieved successfully');
    expect(res.body.data).toBeDefined();

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
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return an error if input data is invalid', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        username: '',
        email: '',
        password: '',
        roles: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.username).toBeDefined();
    expect(res.body.errors.email).toBeDefined();
    expect(res.body.errors.password).toBeDefined();
    expect(res.body.errors.roles).toBeDefined();
  });

  it('should return an error if email already in use', async () => {
    await createTestUser();

    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        username: 'test1',
        email: 'test@me.com',
        password: 'test123',
        roles: [adminRole._id],
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Resource already in use');
    expect(res.body.errors.email).toBeDefined();
  });

  it('should return an error if username already in use', async () => {
    await createTestUser();

    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        username: 'test',
        email: 'test1@me.com',
        password: 'test123',
        roles: [adminRole._id],
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Resource already in use');
    expect(res.body.errors.username).toBeDefined();
  });

  it('should return an error if role is invalid', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        username: 'test',
        email: 'test@me.com',
        password: 'test123',
        roles: ['invalid-id'],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.roles).toBeDefined();
  });

  it('should create a user if input data is valid', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${global.adminToken}`)
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
    const res = await request(app)
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return an error if user id is invalid', async () => {
    const res = await request(app)
      .put('/api/users/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.userId).toBeDefined();
  });

  it('should return an error if user is not found', async () => {
    const res = await request(app)
      .put(`/api/users/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('should return an error if input data is invalid', async () => {
    const res = await request(app)
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('email', '')
      .field('username', '');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.username).toBeDefined();
    expect(res.body.errors.email).toBeDefined();
  });

  it('should return an error if role is invalid', async () => {
    const res = await request(app)
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('email', 'test1@me.com')
      .field('username', 'test1')
      .field('roles', 'invalid-id');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.roles).toBeDefined();
  });

  it('should return an error if email is already in use', async () => {
    await createTestUser({ email: 'test1@me.com' });

    const res = await request(app)
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('email', 'test1@me.com')
      .field('username', 'test1')
      .field('roles', adminRole._id.toString());

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Resource already in use');
    expect(res.body.errors.email).toBeDefined();
  });

  it('should return an error if username is already in use', async () => {
    await createTestUser({ username: 'test1' });

    const res = await request(app)
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('email', 'test1@me.com')
      .field('username', 'test1')
      .field('roles', adminRole._id.toString());

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Resource already in use');
    expect(res.body.errors.username).toBeDefined();
  });

  it('should update user without changing avatar', async () => {
    const res = await request(app)
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('email', 'test1@me.com')
      .field('username', 'test1')
      .field('roles', adminRole._id.toString());

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User updated successfully');
    expect(res.body.data.email).toBe('test1@me.com');
    expect(res.body.data.username).toBe('test1');
    expect(res.body.data.roles).toContain(adminRole._id.toString());
  });

  it('should update user with changing avatar', async () => {
    const res = await request(app)
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

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User updated successfully');
    expect(res.body.data.email).toBe('test1@me.com');
    expect(res.body.data.username).toBe('test1');
    expect(avatarExists).toBe(true);

    await removeTestFile('avatar');
    // await unlink(path.resolve(process.env.AVATAR_DIR, updatedUser.avatar));
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
    const res = await request(app)
      .delete(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return an error if user id is invalid', async () => {
    const res = await request(app)
      .delete('/api/users/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.userId).toBeDefined();
  });

  it('should return an error if user is not found', async () => {
    const res = await request(app)
      .delete(`/api/users/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('should delete user without removing default avatar', async () => {
    const res = await request(app)
      .delete(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    const avatarExists = await access(
      path.resolve(process.env.AVATAR_DIR, 'default.jpg')
    )
      .then(() => true)
      .catch(() => false);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User deleted successfully');
    expect(avatarExists).toBe(true);
  });

  it('should delete user with removing non-default avatar', async () => {
    const avatarPath = path.resolve(process.env.AVATAR_DIR, 'test-avatar.jpg');
    user.avatar = 'test-avatar.jpg';

    await user.save();
    await copyFile(testAvatarPath, avatarPath);

    const res = await request(app)
      .delete(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    const avatarExists = await access(avatarPath)
      .then(() => true)
      .catch(() => false);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User deleted successfully');
    expect(avatarExists).toBe(false);
  });
});
