import request from 'supertest';
import app from '../src/app.js';
import {
  createTestCategory,
  createTestUser,
  updateTestUser,
  createAccessToken,
  getTestRole,
  createTestPost,
  createManyTestCategories,
  createManyTestPosts,
  createManyTestComments,
  createManyTestRoles,
  createManyTestUsers,
  removeAllTestCategories,
  removeAllTestPosts,
  removeAllTestComments,
  removeAllTestRoles,
  removeAllTestUsers,
} from './testUtil.js';

describe('GET /api/dashboard', () => {
  beforeEach(async () => {
    await createTestUser();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestCategories();
    await removeAllTestPosts();
    await removeAllTestComments();
    await removeAllTestRoles();
    await removeAllTestUsers();
  });

  it('should return an error if user does not have permission', async () => {
    const role = await getTestRole('user');
    await updateTestUser({ role: role._id });
    await createAccessToken();

    const result = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return dashboard statistics data', async () => {
    await createTestCategory();
    await createTestPost();
    await createManyTestCategories();
    await createManyTestPosts();
    await createManyTestRoles();
    await createManyTestUsers();
    await createManyTestComments();

    const result = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Statistics data retrieved successfully');
    expect(result.body.data.totalPosts).toBeGreaterThanOrEqual(15);
    expect(result.body.data.totalComments).toBe(15);
    expect(result.body.data.totalCategories).toBeGreaterThanOrEqual(15);
    expect(result.body.data.totalRoles).toBeGreaterThanOrEqual(15);
    expect(result.body.data.totalUsers).toBeGreaterThanOrEqual(15);
    expect(result.body.data.recentPosts).toHaveLength(5);
    expect(result.body.data.recentComments).toHaveLength(5);
  });
});
