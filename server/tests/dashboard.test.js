import request from 'supertest';
import app from '../src/app.js';
import {
  createManyTestCategories,
  createManyTestPosts,
  createManyTestComments,
  createManyTestRoles,
  createManyTestUsers,
  removeTestCategory,
  removeTestPost,
  removeTestComment,
  removeTestRole,
  removeTestUser,
} from './testUtil.js';

describe('GET /api/dashboard', () => {
  beforeEach(async () => {
    await createManyTestCategories();
    await createManyTestPosts();
    await createManyTestRoles();
    await createManyTestUsers();
    await createManyTestComments();
  });

  afterEach(async () => {
    await removeTestCategory();
    await removeTestPost();
    await removeTestComment();
    await removeTestRole();
    await removeTestUser();
  });

  it('should return an error if user does not have permission', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return dashboard statistics data', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Statistics data retrieved successfully');
    expect(res.body.data.totalPosts).toBe(15);
    expect(res.body.data.totalComments).toBe(15);
    expect(res.body.data.totalCategories).toBeGreaterThanOrEqual(15);
    expect(res.body.data.totalRoles).toBeGreaterThanOrEqual(15);
    expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(15);
    expect(res.body.data.recentPosts).toHaveLength(5);
    expect(res.body.data.recentComments).toHaveLength(5);
  });
});
