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
  checkFileExists,
  createToken,
} from './testUtil.js';
import Post from '../src/models/postModel.js';
import cloudinary from '../src/utils/cloudinary.js';

const testPostImagePath = path.resolve(
  process.env.POST_DIR_TEST,
  'test-post.jpg'
);

describe('GET /api/posts/search', () => {
  beforeEach(async () => {
    await createManyTestPosts();
  });

  afterEach(async () => {
    await removeTestPost();
  });

  it('should return a list of posts with default pagination', async () => {
    const result = await request(app)
      .get('/api/posts/search')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Posts retrieved successfully');
    expect(result.body.data).toHaveLength(10);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBe(15);
    expect(result.body.meta.currentPage).toBe(1);
    expect(result.body.meta.totalPages).toBe(2);
  });

  it('should return a list of posts with custom pagination', async () => {
    const result = await request(app)
      .get('/api/posts/search')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        page: 2,
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Posts retrieved successfully');
    expect(result.body.data.length).toBe(5);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBe(15);
    expect(result.body.meta.currentPage).toBe(2);
    expect(result.body.meta.totalPages).toBe(2);
  });

  it('should return a list of posts with custom search', async () => {
    const result = await request(app)
      .get('/api/posts/search')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        q: 'test10',
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Posts retrieved successfully');
    expect(result.body.data).toHaveLength(1);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBe(1);
    expect(result.body.meta.currentPage).toBe(1);
    expect(result.body.meta.totalPages).toBe(1);
  });
});

describe('GET /api/posts/:postId', () => {
  it('should return an error if post id is invalid', async () => {
    const result = await request(app)
      .get('/api/posts/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const result = await request(app)
      .get(`/api/posts/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Post not found');
  });

  it('should return a post for post id is valid', async () => {
    const post = await createTestPost();
    const result = await request(app)
      .get(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Post retrieved successfully');
    expect(result.body.data).toBeDefined();

    await removeTestPost();
  });
});

describe('POST /api/posts', () => {
  afterEach(async () => {
    await removeTestPost();
  });

  it('should return an error if user does not have permission', async () => {
    const result = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if input data is invalid', async () => {
    const result = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('content', '')
      .field('title', '')
      .field('category', '');

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.title).toBeDefined();
    expect(result.body.errors.content).toBeDefined();
    expect(result.body.errors.category).toBeDefined();
  });

  it('should return an error if category is invalid', async () => {
    const result = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('content', 'test')
      .field('title', 'test')
      .field('category', global.validObjectId.toString());

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.category).toBeDefined();
  });

  it('should create a post if input data is valid', async () => {
    const category = await createTestCategory();

    const result = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('content', 'test')
      .field('title', 'test')
      .field('category', category._id.toString())
      .attach('postImage', testPostImagePath);

    expect(result.status).toBe(201);
    expect(result.body.message).toBe('Post created successfully');

    await removeTestCategory();
  });
});

describe('PATCH /api/posts/:postId', () => {
  let post;
  let category;
  let uploadResult;

  beforeEach(async () => {
    uploadResult = await cloudinary.uploader.upload(testPostImagePath, {
      folder: 'postImages',
    });
    category = await createTestCategory();
    post = await createTestPost({
      postImage: uploadResult.secure_url,
    });
  });

  afterEach(async () => {
    await removeTestPost();
    await removeTestCategory();
  });

  it('should return an error if post id is invalid', async () => {
    const result = await request(app)
      .patch('/api/posts/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const result = await request(app)
      .patch(`/api/posts/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Post not found');
  });

  it('should return an error if input data is invalid', async () => {
    const result = await request(app)
      .patch(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('content', '')
      .field('title', '')
      .field('category', '');

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.title).toBeDefined();
    expect(result.body.errors.content).toBeDefined();
    expect(result.body.errors.category).toBeDefined();
  });

  it('should return an error if category is invalid', async () => {
    const result = await request(app)
      .patch(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('content', 'test1')
      .field('title', 'test1')
      .field('category', 'invalid-id');

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.category).toBeDefined();
  });

  it('should update post without changing post image', async () => {
    const result = await request(app)
      .patch(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('content', 'test1')
      .field('title', 'test1')
      .field('category', category._id.toString());

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Post updated successfully');
    expect(result.body.data.content).toBe('test1');
    expect(result.body.data.title).toBe('test1');
    expect(result.body.data.category).toContain(category._id.toString());
  });

  it('should update post with changing post image', async () => {
    const result = await request(app)
      .patch(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('title', 'test1')
      .field('content', 'test1')
      .attach('postImage', testPostImagePath);

    const updatedPost = await Post.findById(post._id);
    const postImageExists = await checkFileExists(updatedPost.postImage);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Post updated successfully');
    expect(result.body.data.title).toBe('test1');
    expect(result.body.data.content).toBe('test1');
    expect(postImageExists).toBe(true);

    await removeTestFile(updatedPost.postImage);
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
    const result = await request(app)
      .delete('/api/posts/invalid-id')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const result = await request(app)
      .delete(`/api/posts/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Post not found');
  });

  it('should delete post with removing post image', async () => {
    const uploadResult = await cloudinary.uploader.upload(testPostImagePath, {
      folder: 'posts',
    });

    post.postImage = uploadResult.secure_url;
    await post.save();

    const result = await request(app)
      .delete(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    const postImageExists = await checkFileExists(post.postImage);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Post deleted successfully');
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
    const result = await request(app).patch(`/api/posts/${post._id}/like`);

    expect(result.status).toBe(401);
    expect(result.body.message).toBe('Token is not provided');
  });

  it('should return an error if post is not found', async () => {
    const result = await request(app)
      .patch(`/api/posts/${global.validObjectId}/like`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Post not found');
  });

  it('should return an error if post id is invalid', async () => {
    const result = await request(app)
      .patch('/api/posts/invalid-id/like')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.postId).toBeDefined();
  });

  it('should user like a post', async () => {
    const result = await request(app)
      .patch(`/api/posts/${post._id}/like`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Post liked successfully');
  });

  it('should user unlike a post', async () => {
    const user = await createTestUser();
    const adminToken = createToken('auth', 'admin', user._id);
    post.likes.push(user._id);
    await post.save();

    const result = await request(app)
      .patch(`/api/posts/${post._id}/like`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Post unliked successfully');

    await removeTestUser();
  });
});
