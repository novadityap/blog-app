import request from 'supertest';
import app from '../src/app.js';
import {
  createTestCategory,
  createManyTestCategories,
  removeTestCategory,
} from './testUtil.js';

describe('GET /api/categories', () => {
  it('should return all categories', async () => {
    await createManyTestCategories();

    const result = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Categories retrieved successfully');

    await removeTestCategory();
  });
});

describe('GET /api/categories/search', () => {
  beforeEach(async () => {
    await createManyTestCategories();
  });

  afterEach(async () => {
    await removeTestCategory();
  });

  it('should return a list of categories with default pagination', async () => {
    const result = await request(app)
      .get('/api/categories/search')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Categories retrieved successfully');
    expect(result.body.data).toHaveLength(10);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBe(15);
    expect(result.body.meta.currentPage).toBe(1);
    expect(result.body.meta.totalPages).toBe(2);
  });

  it('should return a list of categories with custom pagination', async () => {
    const result = await request(app)
      .get('/api/categories/search')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        page: 2,
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Categories retrieved successfully');
    expect(result.body.data.length).toBe(5);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBe(15);
    expect(result.body.meta.currentPage).toBe(2);
    expect(result.body.meta.totalPages).toBe(2);
  });

  it('should return a list of categories with custom search', async () => {
    const result = await request(app)
      .get('/api/categories/search')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        q: 'test10',
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Categories retrieved successfully');
    expect(result.body.data).toHaveLength(1);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBe(1);
    expect(result.body.meta.currentPage).toBe(1);
    expect(result.body.meta.totalPages).toBe(1);
  });
});

describe('GET /api/categories/:categoryId', () => {
  it('should return an error if category id is invalid', async () => {
    const result = await request(app)
      .get('/api/categories/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.categoryId).toBeDefined();
  });

  it('should return an error if category is not found', async () => {
    const result = await request(app)
      .get(`/api/categories/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Category not found');
  });

  it('should return a category if category id is valid', async () => {
    const category = await createTestCategory();
    const result = await request(app)
      .get(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Category retrieved successfully');
    expect(result.body.data).toBeDefined();

    await removeTestCategory();
  });
});

describe('POST /api/categories', () => {
  afterEach(async () => {
    await removeTestCategory();
  });

  it('should return an error if user does not have permission', async () => {
    const result = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if input data is invalid', async () => {
    const result = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        name: '',
      });

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.name).toBeDefined();
  });

  it('should return an error if name already in use', async () => {
    await createTestCategory();

    const result = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        name: 'test',
      });

    expect(result.status).toBe(409);
    expect(result.body.message).toBe('Resource already in use');
    expect(result.body.errors.name).toBeDefined();
  });

  it('should create a category if input data is valid', async () => {
    const result = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({ name: 'test' });

    expect(result.status).toBe(201);
    expect(result.body.message).toBe('Category created successfully');
  });
});

describe('PATCH /api/categories/:categoryId', () => {
  let category;

  beforeEach(async () => {
    category = await createTestCategory();
  });

  afterEach(async () => {
    await removeTestCategory();
  });

  it('should return an error if user does not have permission', async () => {
    const result = await request(app)
      .patch(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if category id is invalid', async () => {
    const result = await request(app)
      .patch('/api/categories/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.categoryId).toBeDefined();
  });

  it('should return an error if name already in use', async () => {
    await createTestCategory({ name: 'test1' });

    const result = await request(app)
      .patch(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        name: 'test1',
      });

    expect(result.status).toBe(409);
    expect(result.body.message).toBe('Resource already in use');
    expect(result.body.errors.name).toBeDefined();
  });

  it('should return an error if category is not found', async () => {
    const result = await request(app)
      .patch(`/api/categories/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Category not found');
  });

  it('should update category if input data is valid', async () => {
    const result = await request(app)
      .patch(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        name: 'test1',
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Category updated successfully');
    expect(result.body.data.name).toBe('test1');
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
    const result = await request(app)
      .delete(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if category id is invalid', async () => {
    const result = await request(app)
      .delete('/api/categories/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.categoryId).toBeDefined();
  });

  it('should return an error if category is not found', async () => {
    const result = await request(app)
      .delete(`/api/categories/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Category not found');
  });

  it('should delete category if category id is valid', async () => {
    const result = await request(app)
      .delete(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Category deleted successfully');
  });
});
