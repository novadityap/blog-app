import request from 'supertest';
import app from '../src/app.js';
import {
  getTestRole,
  createTestUser,
  getTestUser,
  updateTestUser,
  removeAllTestUsers,
  createTestPost,
  getTestPost,
  updateTestPost,
  createManyTestPosts,
  removeAllTestPosts,
  createTestCategory,
  getTestCategory,
  removeAllTestCategories,
  removeTestFile,
  checkFileExists,
  createAccessToken,
} from './testUtil.js';
import cloudinary from '../src/utils/cloudinary.js';

describe('GET /api/posts/search', () => {
  beforeEach(async () => {
    await createTestUser();
    await createTestCategory();
    await createManyTestPosts();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestPosts();
    await removeAllTestCategories();
    await removeAllTestUsers();
  });

  it('should return a list of posts with default pagination', async () => {
    const result = await request(app)
      .get('/api/posts/search')
      .set('Authorization', `Bearer ${global.accessToken}`);

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
      .set('Authorization', `Bearer ${global.accessToken}`)
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
      .set('Authorization', `Bearer ${global.accessToken}`)
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
  afterEach(async () => {
    await removeAllTestPosts();
    await removeAllTestCategories();
    await removeAllTestUsers();
  });

  it('should return an error if post id is invalid', async () => {
    const result = await request(app)
      .get('/api/posts/invalid-id')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const result = await request(app)
      .get(`/api/posts/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Post not found');
  });

  it('should return a post for post id is valid', async () => {
    await createTestUser();
    await createTestCategory();

    const post = await createTestPost();
    const result = await request(app)
      .get(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Post retrieved successfully');
    expect(result.body.data).toBeDefined();
  });
});

describe('POST /api/posts', () => {
  beforeEach(async () => {
    await createTestUser();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestPosts();
    await removeAllTestUsers();
  });

  it('should return an error if user does not have permission', async () => {
    const role = await getTestRole('user');
    await updateTestUser({ role: role._id });
    await createAccessToken();

    const result = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if input data is invalid', async () => {
    const result = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${global.accessToken}`)
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
      .set('Authorization', `Bearer ${global.accessToken}`)
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
      .set('Authorization', `Bearer ${global.accessToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('content', 'test')
      .field('title', 'test')
      .field('category', category._id.toString())
      .attach('postImage', global.testPostImagePath);

    expect(result.status).toBe(201);
    expect(result.body.message).toBe('Post created successfully');

    await removeAllTestCategories();
  });
});

describe('PATCH /api/posts/:postId', () => {
  beforeEach(async () => {
    await createTestUser();
    await createTestCategory();
    await createTestPost();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestPosts();
    await removeAllTestCategories();
    await removeAllTestUsers();
  });

  it('should return an error if post id is invalid', async () => {
    const result = await request(app)
      .patch('/api/posts/invalid-id')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const result = await request(app)
      .patch(`/api/posts/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Post not found');
  });

  it('should return an error if input data is invalid', async () => {
    const post = await getTestPost();
    const result = await request(app)
      .patch(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`)
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
    const post = await getTestPost();
    const result = await request(app)
      .patch(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('content', 'test1')
      .field('title', 'test1')
      .field('category', 'invalid-id');

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.category).toBeDefined();
  });

  it('should update post without changing post image', async () => {
    const category = await getTestCategory();
    const post = await getTestPost();
    const result = await request(app)
      .patch(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`)
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
    const uploadResult = await cloudinary.uploader.upload(
      global.testPostImagePath,
      { folder: 'postImages' }
    );
    const post = await updateTestPost({ postImage: uploadResult.secure_url });
    const result = await request(app)
      .patch(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('title', 'test1')
      .field('content', 'test1')
      .attach('postImage', global.testPostImagePath);

    const updatedPost = await getTestPost('test1');
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
  beforeEach(async () => {
    await createTestUser();
    await createTestCategory();
    await createTestPost();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestPosts();
    await removeAllTestCategories();
    await removeAllTestUsers();
  });

  it('should return an error if post id is invalid', async () => {
    const result = await request(app)
      .delete('/api/posts/invalid-id')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const result = await request(app)
      .delete(`/api/posts/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Post not found');
  });

  it('should delete post with removing post image', async () => {
    const uploadResult = await cloudinary.uploader.upload(
      global.testPostImagePath,
      {
        folder: 'posts',
      }
    );

    await updateTestPost({ postImage: uploadResult.secure_url });

    const post = await getTestPost();
    const result = await request(app)
      .delete(`/api/posts/${post._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    const postImageExists = await checkFileExists(post.postImage);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Post deleted successfully');
    expect(postImageExists).toBe(false);
  });
});

describe('PATCH /api/posts/:postId/like', () => {
  beforeEach(async () => {
    await createTestUser();
    await createTestCategory();
    await createTestPost();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestPosts();
    await removeAllTestCategories();
    await removeAllTestUsers();
  });

  it('should return an error if user does not authenticate', async () => {
    const result = await request(app).patch(
      `/api/posts/${global.validObjectId}/like`
    );

    expect(result.status).toBe(401);
    expect(result.body.message).toBe('Token is not provided');
  });

  it('should return an error if post is not found', async () => {
    const result = await request(app)
      .patch(`/api/posts/${global.validObjectId}/like`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Post not found');
  });

  it('should return an error if post id is invalid', async () => {
    const result = await request(app)
      .patch('/api/posts/invalid-id/like')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.postId).toBeDefined();
  });

  it('should user like a post', async () => {
    const post = await getTestPost();
    const result = await request(app)
      .patch(`/api/posts/${post._id}/like`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Post liked successfully');
  });

  it('should user unlike a post', async () => {
    const post = await getTestPost();
    const user = await getTestUser();

    await updateTestPost({ likes: [user._id] });

    const result = await request(app)
      .patch(`/api/posts/${post._id}/like`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Post unliked successfully');
  });
});
