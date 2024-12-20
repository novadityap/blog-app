import app from '../src/app.js';
import request from 'supertest';

describe('GET /api/permissions/list', () => {
  it('should return an error if user does not have permission', async () => {
    const res = await request(app)
      .get('/api/permissions/list')
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return all permissions', async () => {
    const res = await request(app)
      .get('/api/permissions/list')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Permissions retrieved successfully');
    expect(res.body.data.length).toBeGreaterThanOrEqual(5);
  });
});
