import request from 'supertest';
import app from '../src/app.js';
import {
  createTestRole,
  createManyTestRoles,
  removeTestRole,
  createTestPermission,
  removeTestPermission,
} from './testUtil.js';

describe('GET /api/roles', () => {
  beforeAll(async () => {
    await createManyTestRoles();
  });

  afterAll(async () => {
    await removeTestRole();
  });

  it('should return an error if user does not have permission', async () => {
    const res = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return all roles', async () => {
    const res = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Roles retrieved successfully');
    expect(res.body.data).toBeDefined();
  });
});

describe('GET /api/roles', () => {
  beforeEach(async () => {
    await createManyTestRoles();
  });

  afterEach(async () => {
    await removeTestRole();
  });

  it('should return an error if user does not have permission', async () => {
    const res = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return a list of roles with default pagination', async () => {
    const res = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Roles retrieved successfully');
    expect(res.body.data).toHaveLength(10);
    expect(res.body.meta.pageSize).toBe(10);
    expect(res.body.meta.totalItems).toBeGreaterThanOrEqual(15);
    expect(res.body.meta.currentPage).toBe(1);
    expect(res.body.meta.totalPages).toBe(2);
  });

  it('should return a list of roles with custom pagination', async () => {
    const res = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        page: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Roles retrieved successfully');
    expect(res.body.data.length).toBeGreaterThanOrEqual(5);
    expect(res.body.meta.pageSize).toBe(10);
    expect(res.body.meta.totalItems).toBeGreaterThanOrEqual(15);
    expect(res.body.meta.currentPage).toBe(2);
    expect(res.body.meta.totalPages).toBe(2);
  });

  it('should return a list of roles with custom search', async () => {
    const res = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        search: 'test10',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Roles retrieved successfully');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.pageSize).toBe(10);
    expect(res.body.meta.totalItems).toBe(1);
    expect(res.body.meta.currentPage).toBe(1);
    expect(res.body.meta.totalPages).toBe(1);
  });
});

describe('GET /api/roles/:roleId', () => {
  it('should return an error if user does not have permission', async () => {
    const res = await request(app)
      .get(`/api/roles/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return an error if role id is invalid', async () => {
    const res = await request(app)
      .get('/api/roles/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.roleId).toBeDefined();
  });

  it('should return an error if role is not found', async () => {
    const res = await request(app)
      .get(`/api/roles/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Role not found');
  });

  it('should return a role if role id is valid', async () => {
    const role = await createTestRole();
    const res = await request(app)
      .get(`/api/roles/${role._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Role retrieved successfully');
    expect(res.body.data).toBeDefined();

    await removeTestRole();
  });
});

describe('POST /api/roles', () => {
  let permission;

  beforeEach(async () => {
    permission = await createTestPermission();
  });

  afterEach(async () => {
    await removeTestRole();
    await removeTestPermission();
  });

  it('should return an error if user does not have permission', async () => {
    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return an error if input data is invalid', async () => {
    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        name: '',
        permissions: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.name).toBeDefined();
    expect(res.body.errors.permissions).toBeDefined();
  });

  it('should return an error if name already in use', async () => {
    await createTestRole();

    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        name: 'test',
        permissions: [`${permission._id}`],
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Resource already in use');
    expect(res.body.errors.name).toBeDefined();
  });

  it('should return an error if permission id is invalid', async () => {
    await createTestRole();

    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        name: 'test',
        permissions: ['invalid-id'],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.permissions).toBeDefined();
  });

  it('should create a role if input data is valid', async () => {
    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        name: 'test',
        permissions: [`${permission._id}`],
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Role created successfully');
  });
});

describe('PUT /api/roles/:roleId', () => {
  let role;
  let permission;

  beforeEach(async () => {
    role = await createTestRole();
    permission = await createTestPermission();
  });

  afterEach(async () => {
    await removeTestRole();
    await removeTestPermission();
  });

  it('should return an error if user does not have permission', async () => {
    const res = await request(app)
      .put(`/api/roles/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return an error if role id is invalid', async () => {
    const res = await request(app)
      .put('/api/roles/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.roleId).toBeDefined();
  });

  it('should return an error if permission id is invalid', async () => {
    await createTestRole();

    const res = await request(app)
      .put(`/api/roles/${role._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        name: 'test1',
        permissions: ['invalid-id'],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.permissions).toBeDefined();
  });

  it('should return an error if name already in use', async () => {
    await createTestRole({ name: 'test1' });

    const res = await request(app)
      .put(`/api/roles/${role._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        name: 'test1',
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Resource already in use');
    expect(res.body.errors.name).toBeDefined();
  });

  it('should return an error if role is not found', async () => {
    const res = await request(app)
      .put(`/api/roles/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Role not found');
  });

  it('should update role if input data is valid', async () => {
    const res = await request(app)
      .put(`/api/roles/${role._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        name: 'test1',
        permissions: [permission._id],
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Role updated successfully');
    expect(res.body.data.name).toBe('test1');
    expect(res.body.data.permissions).toContain(permission._id.toString());
  });
});

describe('DELETE /api/roles/:roleId', () => {
  let role;

  beforeEach(async () => {
    role = await createTestRole();
  });

  afterEach(async () => {
    await removeTestRole();
  });

  it('should return an error if user does not have permission', async () => {
    const res = await request(app)
      .delete(`/api/roles/${role._id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return an error if role id is invalid', async () => {
    const res = await request(app)
      .delete('/api/roles/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.roleId).toBeDefined();
  });

  it('should return an error if role is not found', async () => {
    const res = await request(app)
      .delete(`/api/roles/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Role not found');
  });

  it('should delete role if role id is valid', async () => {
    const res = await request(app)
      .delete(`/api/roles/${role._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Role deleted successfully');
  });
});
