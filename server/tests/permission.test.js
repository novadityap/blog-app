import app from '../src/app.js';
import request from 'supertest';

describe('GET /api/permissions/list', () => {
  it('should return an error if user does not have permission', async () => {
    const result = await request(app)
      .get('/api/permissions/list')
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return all permissions', async () => {
    const result = await request(app)
      .get('/api/permissions/list')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Permissions retrieved successfully');
    expect(result.body.data.length).toBeGreaterThanOrEqual(5);
  });
});
