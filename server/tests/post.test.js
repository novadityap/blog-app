import request from 'supertest';
import app from '../src/app.js';
import path from 'node:path';
import {
  createTestUser,
  removeTestUser,
  createTestPost,
  createManyTestPosts,
  removeTestPost,
  createTestCategory,
  removeTestCategory,
  removeTestFile,
  createToken,
} from './testUtil.js';
import { access, copyFile } from 'node:fs/promises';
import Post from '../src/models/postModel.js';

const testPostImagePath = path.resolve(
  process.env.TEST_POST_DIR,
  'test-post.jpg'
);

describe('GET /api/posts', () => {
  beforeEach(async () => {
    await createManyTestPosts();
  });

  afterEach(async () => {
    await removeTestPost();
  });

  it('should return a list of posts with default pagination', async () => {
    const res = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Posts retrieved successfully');
    expect(res.body.data).toHaveLength(10);
    expect(res.body.meta.pageSize).toBe(10);
    expect(res.body.meta.totalItems).toBe(15);
    expect(res.body.meta.currentPage).toBe(1);
    expect(res.body.meta.totalPages).toBe(2);
  });

  it('should return a list of posts with custom pagination', async () => {
    const res = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        page: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Posts retrieved successfully');
    expect(res.body.data.length).toBe(5);
    expect(res.body.meta.pageSize).toBe(10);
    expect(res.body.meta.totalItems).toBe(15);
    expect(res.body.meta.currentPage).toBe(2);
    expect(res.body.meta.totalPages).toBe(2);
  });

  it('should return a list of posts with custom search', async () => {
    const res = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        search: 'test10',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Posts retrieved successfully');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.pageSize).toBe(10);
    expect(res.body.meta.totalItems).toBe(1);
    expect(res.body.meta.currentPage).toBe(1);
    expect(res.body.meta.totalPages).toBe(1);
  });
});

describe('GET /api/posts/:postId', () => {
  it('should return an error if post id is invalid', async () => {
    const res = await request(app)
      .get('/api/posts/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const res = await request(app)
      .get(`/api/posts/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Post not found');
  });

  it('should return a post for post id is valid', async () => {
    const post = await createTestPost();
    const res = await request(app)
      .get(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post retrieved successfully');
    expect(res.body.data).toBeDefined();

    await removeTestPost();
  });
});

describe('POST /api/posts', () => {
  afterEach(async () => {
    await removeTestPost();
  });

  it('should return an error if user does not have permission', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return an error if input data is invalid', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('content', '')
      .field('title', '')
      .field('category', '');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.title).toBeDefined();
    expect(res.body.errors.content).toBeDefined();
    expect(res.body.errors.category).toBeDefined();
  });

  it('should return an error if category is invalid', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('content', 'test')
      .field('title', 'test')
      .field('category', global.validObjectId.toString());

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.category).toBeDefined();
  });

  it('should create a post if input data is valid', async () => {
    const category = await createTestCategory();

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('content', 'test')
      .field('title', 'test')
      .field('category', category._id.toString());

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Post created successfully');

    await removeTestCategory();
  });
});

describe('PUT /api/posts/:postId', () => {
  let post;
  let category;

  beforeEach(async () => {
    category = await createTestCategory();
    post = await createTestPost();
  });

  afterEach(async () => {
    await removeTestPost();
    await removeTestCategory();
  });

  it('should return an error if post id is invalid', async () => {
    const res = await request(app)
      .put('/api/posts/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const res = await request(app)
      .put(`/api/posts/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Post not found');
  });

  it('should return an error if input data is invalid', async () => {
    const res = await request(app)
      .put(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('content', '')
      .field('title', '')
      .field('category', '');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.title).toBeDefined();
    expect(res.body.errors.content).toBeDefined();
    expect(res.body.errors.category).toBeDefined();
  });

  it('should return an error if category is invalid', async () => {
    const res = await request(app)
      .put(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('content', 'test1')
      .field('title', 'test1')
      .field('category', 'invalid-id');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.category).toBeDefined();
  });

  it('should update post without changing post image', async () => {
    const res = await request(app)
      .put(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('content', 'test1')
      .field('title', 'test1')
      .field('category', category._id.toString());

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post updated successfully');
    expect(res.body.data.content).toBe('test1');
    expect(res.body.data.title).toBe('test1');
    expect(res.body.data.category).toContain(category._id.toString());
  });

  it('should update post with changing post image', async () => {
    const res = await request(app)
      .put(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('title', 'test1')
      .field('content', 'test1')
      .attach('postImage', testPostImagePath);

    const updatedPost = await Post.findById(post._id);
    const postImageExists = await access(
      path.resolve(process.env.POST_DIR, updatedPost.postImage)
    )
      .then(() => true)
      .catch(() => false);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post updated successfully');
    expect(res.body.data.title).toBe('test1');
    expect(res.body.data.content).toBe('test1');
    expect(postImageExists).toBe(true);

    await removeTestFile('postImage');
  });
});

describe('DELETE /api/posts/:postId', () => {
  let post;

  beforeEach(async () => {
    post = await createTestPost();
  });

  afterEach(async () => {
    await removeTestPost();
  });

  it('should return an error if post id is invalid', async () => {
    const res = await request(app)
      .delete('/api/posts/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const res = await request(app)
      .delete(`/api/posts/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Post not found');
  });

  it('should delete post without removing default post image', async () => {
    const res = await request(app)
      .delete(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    const postImageExists = await access(
      path.resolve(process.env.POST_DIR, 'default.jpg')
    )
      .then(() => true)
      .catch(() => false);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post deleted successfully');
    expect(postImageExists).toBe(true);
  });

  it('should delete post with removing non-default post image', async () => {
    const avatarPath = path.resolve(process.env.POST_DIR, 'test-post.jpg');
    post.postImage = 'test-post.jpg';

    await post.save();
    await copyFile(testPostImagePath, avatarPath);

    const res = await request(app)
      .delete(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    const postImageExists = await access(avatarPath)
      .then(() => true)
      .catch(() => false);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post deleted successfully');
    expect(postImageExists).toBe(false);
  });
});

describe('PATCH /api/posts/:postId/like', () => {
  let post;

  beforeEach(async () => {
    post = await createTestPost();
  });

  afterEach(async () => {
    await removeTestPost();
  });

  it('should return an error if user does not authenticate', async () => {
    const res = await request(app).patch(`/api/posts/${post._id}/like`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token is missing');
  });

  it('should return an error if post is not found', async () => {
    const res = await request(app)
      .patch(`/api/posts/${global.validObjectId}/like`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Post not found');
  });

  it('should return an error if post id is invalid', async () => {
    const res = await request(app)
      .patch('/api/posts/invalid-id/like')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.postId).toBeDefined();
  });

  it('should user like a post', async () => {
    const res = await request(app)
      .patch(`/api/posts/${post._id}/like`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post liked successfully');
  });

  it('should user unlike a post', async () => {
    const user = await createTestUser();
    const adminToken = createToken('auth', 'admin', user._id);
    post.likes.push(user._id);
    await post.save();

    const res = await request(app)
      .patch(`/api/posts/${post._id}/like`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post unliked successfully');

    await removeTestUser();
  });
});
