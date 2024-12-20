import request from 'supertest';
import app from '../src/app.js';
import {
  createTestCategory,
  createManyTestCategories,
  removeTestCategory,
} from './testUtil.js';

describe('GET /api/categories/list', () => {
  it('should return all categories', async () => {
    await createManyTestCategories();

    const res = await request(app)
      .get('/api/categories/list')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Categories retrieved successfully');

    await removeTestCategory();
  });
})

describe('GET /api/categories', () => {
  beforeEach(async () => {
    await createManyTestCategories();
  });

  afterEach(async () => {
    await removeTestCategory();
  });

  it('should return a list of categories with default pagination', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Categories retrieved successfully');
    expect(res.body.data).toHaveLength(10);
    expect(res.body.meta.pageSize).toBe(10);
    expect(res.body.meta.totalItems).toBe(15);
    expect(res.body.meta.currentPage).toBe(1);
    expect(res.body.meta.totalPages).toBe(2);
  });

  it('should return a list of categories with custom pagination', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        page: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Categories retrieved successfully');
    expect(res.body.data.length).toBe(5);
    expect(res.body.meta.pageSize).toBe(10);
    expect(res.body.meta.totalItems).toBe(15);
    expect(res.body.meta.currentPage).toBe(2);
    expect(res.body.meta.totalPages).toBe(2);
  });

  it('should return a list of categories with custom search', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        search: 'test10',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Categories retrieved successfully');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.pageSize).toBe(10);
    expect(res.body.meta.totalItems).toBe(1);
    expect(res.body.meta.currentPage).toBe(1);
    expect(res.body.meta.totalPages).toBe(1);
  });
});

describe('GET /api/categories/:categoryId', () => {
  it('should return an error if category id is invalid', async () => {
    const res = await request(app)
      .get('/api/categories/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.categoryId).toBeDefined();
  });

  it('should return an error if category is not found', async () => {
    const res = await request(app)
      .get(`/api/categories/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Category not found');
  });

  it('should return a category if category id is valid', async () => {
    const category = await createTestCategory();
    const res = await request(app)
      .get(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Category retrieved successfully');
    expect(res.body.data).toBeDefined();

    await removeTestCategory();
  });
});

describe('POST /api/categories', () => {
  afterEach(async () => {
    await removeTestCategory();
  });

  it('should return an error if user does not have permission', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return an error if input data is invalid', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        name: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.name).toBeDefined();
  });

  it('should return an error if name already in use', async () => {
    await createTestCategory();

    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        name: 'test',
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Resource already in use');
    expect(res.body.errors.name).toBeDefined();
  });

  it('should create a category if input data is valid', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({ name: 'test' });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Category created successfully');
  });
});

describe('PUT /api/categories/:categoryId', () => {
  let category;

  beforeEach(async () => {
    category = await createTestCategory();
  });

  afterEach(async () => {
    await removeTestCategory();
  });

  it('should return an error if user does not have permission', async () => {
    const res = await request(app)
      .put(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return an error if category id is invalid', async () => {
    const res = await request(app)
      .put('/api/categories/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.categoryId).toBeDefined();
  });

  it('should return an error if name already in use', async () => {
    await createTestCategory({ name: 'test1' });

    const res = await request(app)
      .put(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        name: 'test1',
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Resource already in use');
    expect(res.body.errors.name).toBeDefined();
  });

  it('should return an error if category is not found', async () => {
    const res = await request(app)
      .put(`/api/categories/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Category not found');
  });

  it('should update category if input data is valid', async () => {
    const res = await request(app)
      .put(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        name: 'test1',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Category updated successfully');
    expect(res.body.data.name).toBe('test1');
  });
});

describe('DELETE /api/categories/:categoryId', () => {
  let category;

  beforeEach(async () => {
    category = await createTestCategory();
  });

  afterEach(async () => {
    await removeTestCategory();
  });

  it('should return an error if user does not have permission', async () => {
    const res = await request(app)
      .delete(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return an error if category id is invalid', async () => {
    const res = await request(app)
      .delete('/api/categories/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.categoryId).toBeDefined();
  });

  it('should return an error if category is not found', async () => {
    const res = await request(app)
      .delete(`/api/categories/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Category not found');
  });

  it('should delete category if category id is valid', async () => {
    const res = await request(app)
      .delete(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Category deleted successfully');
  });
});
