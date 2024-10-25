import mongoose from 'mongoose';
import connectDB from '../src/config/connection.js';
import seedRole from '../src/seeders/roleSeeder.js';
import seedPermission from '../src/seeders/permissionSeeder.js';
import Role from '../src/models/roleModel.js';
import Permission from '../src/models/permissionModel.js';
import app from '../src/app.js';
import request from 'supertest';
import path from 'node:path';
import {
  createAuthToken,
  createTestPost,
  removeTestPost,
  getTestPost,
  createTestCategory,
  removeTestCategory,
  createManyTestPosts,
  removeAllTestPosts,
  fileExists,
  removeFile,
  copyFile,
} from './testUtil.js';

const invalidId = undefined;
const missingId = new mongoose.Types.ObjectId();
const token = createAuthToken('auth');
const testPostImagePath = path.join(
  process.cwd(),
  'tests/uploads/posts',
  'test-post.jpg'
);
const cases = [
  {
    name: 'invalid post id',
    id: invalidId,
    expectedStatus: 400,
    expectedMessage: 'Invalid post id',
  },
  {
    name: 'missing post id',
    id: missingId,
    expectedStatus: 404,
    expectedMessage: 'Post not found',
  },
];

beforeAll(async () => {
  await connectDB();
  await seedPermission();
  await seedRole();
});

afterAll(async () => {
  await Role.deleteMany({});
  await Permission.deleteMany({});
  await mongoose.connection.close();
});

describe('GET /api/posts', () => {
  beforeEach(async () => {
    await createManyTestPosts(3);
  });

  afterEach(async () => {
    await removeAllTestPosts();
  });

  it('should return 200 and fetch all posts without search query', async () => {
    const res = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .query({
        page: 1,
        limit: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Posts found');
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.pageSize).toBe(2);
    expect(res.body.meta.currentPage).toBe(1);
  });

  it('should return 200 and fetch posts with search query matching title', async () => {
    const res = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .query({
        limit: 10,
        page: 1,
        search: 'test1',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(200);
    expect(res.body.message).toBe('Posts found');
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 200 and empty data when no post matches the search query', async () => {
    const res = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .query({
        limit: 10,
        page: 1,
        search: 'notexist',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('No posts found');
    expect(res.body.data).toHaveLength(0);
  });
});

describe('GET /api/posts/:id', () => {
  afterEach(async () => {
    await removeTestPost();
  });

  it.each(cases)(
    'should return $expectedStatus for post with $name',
    async ({ id, expectedStatus, expectedMessage }) => {
      const res = await request(app)
        .get(`/api/posts/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(expectedStatus);
      expect(res.body.message).toBe(expectedMessage);
    }
  );

  it('should return 200 and post for valid id', async () => {
    const post = await createTestPost();
    const res = await request(app)
      .get(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post found');
    expect(res.body.data).toBeDefined();
  });
});

describe('POST /api/posts', () => {
  let category;

  beforeEach(async () => {
    category = await createTestCategory();
  });

  afterEach(async () => {
    await removeTestPost();
    await removeTestCategory();
  });

  it('should return 400 for invalid input', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.title).toBeDefined();
    expect(res.body.errors.content).toBeDefined();
    expect(res.body.errors.category).toBeDefined();
  });

  it('should return 404 for not exists category', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data')
      .field('title', 'test')
      .field('content', 'test')
      .field('category', missingId.toString());

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Category not found');
  });

  it('should return 201 and created post without image', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data')
      .field('title', 'test')
      .field('content', 'test')
      .field('category', category._id.toString());

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Post created successfully');
  });

  it('should return 201 and created post with image', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data')
      .field('title', 'test')
      .field('content', 'test')
      .field('category', category._id.toString())
      .attach('postImage', testPostImagePath);

    const post = await getTestPost();
    const postImageExists = await fileExists('posts', post.postImage);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Post created successfully');
    expect(postImageExists).toBe(true);

    await removeFile('posts', post.postImage);
  });
});

describe('PATCH /api/posts/:id', () => {
  let post;
  let category;

  beforeEach(async () => {
    post = await createTestPost();
    category = await createTestCategory();
  });

  afterEach(async () => {
    await removeTestPost();
  });

  it.each(cases)(
    'should return $expectedStatus for post with $name',
    async ({ id, expectedStatus, expectedMessage }) => {
      const res = await request(app)
        .patch(`/api/posts/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'multipart/form-data');

      expect(res.status).toBe(expectedStatus);
      expect(res.body.message).toBe(expectedMessage);
    }
  );

  it('should return 400 for invalid input', async () => {
    const res = await request(app)
      .patch(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.title).toBeDefined();
    expect(res.body.errors.content).toBeDefined();
    expect(res.body.errors.category).toBeDefined();
  });

  it('should return 200 and updated post without image', async () => {
    const res = await request(app)
      .patch(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data')
      .field('title', 'test')
      .field('content', 'test')
      .field('category', category._id.toString());

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post updated successfully');
    expect(res.body.data.postImage).toContain('default.jpg');
  });

  it('should return 200 and updated post with image', async () => {
    const res = await request(app)
      .patch(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data')
      .field('title', 'test')
      .field('content', 'test')
      .field('category', category._id.toString())
      .attach('postImage', testPostImagePath);

    const updatedPost = await getTestPost();
    const postImageExists = await fileExists('posts', updatedPost.postImage);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post updated successfully');
    expect(postImageExists).toBe(true);

    await removeFile('posts', updatedPost.postImage);
  });
});

describe('DELETE /api/posts/:id', () => {
  let post;

  beforeEach(async () => {
    post = await createTestPost();
  });

  afterEach(async () => {
    await removeTestPost();
  });

  it.each(cases)(
    'should return $expectedStatus for post with $name',
    async ({ id, expectedStatus, expectedMessage }) => {
      const res = await request(app)
        .delete(`/api/posts/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(expectedStatus);
      expect(res.body.message).toBe(expectedMessage);
    }
  );

  it('should return 200 and deleted post without deleting default image', async () => {
    const res = await request(app)
      .delete(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${token}`);

    const postImageExists = await fileExists('posts', post.postImage);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post deleted successfully');
    expect(postImageExists).toBe(true);
  });

  it('should return 200 and deleted post with deleting non-default image', async () => {
    post.postImage = 'test-post.jpg';
    await post.save();
    await copyFile(testPostImagePath, 'posts');

    const res = await request(app)
      .delete(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data');

    const postImageExists = await fileExists('posts', post.postImage);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post deleted successfully');
    expect(postImageExists).toBe(false);
  });
});
