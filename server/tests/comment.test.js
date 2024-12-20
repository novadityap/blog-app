import request from 'supertest';
import app from '../src/app.js';
import {
  createTestComment,
  createManyTestComments,
  removeTestComment,
  createToken,
  createTestUser,
  removeTestUser,
  createTestPost,
  removeTestPost,
} from './testUtil.js';

describe('GET /api/posts/:postId/comments/:commentId', () => {
  let comment;
  let post;

  beforeEach(async () => {
    post = await createTestPost();
    comment = await createTestComment();
  });

  afterEach(async () => {
    await removeTestPost();
    await removeTestComment();
  });

  it('should return an error if user does not have permission', async () => {
    const res = await request(app)
      .get(`/api/posts/${post._id}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return an error if post id is invalid', async () => {
    const res = await request(app)
      .delete(`/api/posts/invalid-id/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const res = await request(app)
      .delete(`/api/posts/${global.validObjectId}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Post not found');
  });

  it('should return an error if comment id is invalid', async () => {
    const res = await request(app)
      .delete(`/api/posts/${post._id}/comments/invalid-id`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.commentId).toBeDefined();
  });

  it('should return an error if comment is not found', async () => {
    const res = await request(app)
      .delete(`/api/posts/${post._id}/comments/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Comment not found');
  });

  it('should return a comment if comment id is valid', async () => {
    const res = await request(app)
      .get(`/api/posts/${post._id}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Comment retrieved successfully');
  });
});

describe('GET /api/comments', () => {
  beforeEach(async () => {
    await createManyTestComments();
  });

  afterEach(async () => {
    await removeTestComment();
  });

  it('should return an error if user does not have permission', async () => {
    const res = await request(app)
      .get('/api/comments')
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return a list of comments with default pagination', async () => {
    const res = await request(app)
      .get('/api/comments')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Comments retrieved successfully');
    expect(res.body.data).toHaveLength(10);
    expect(res.body.meta.pageSize).toBe(10);
    expect(res.body.meta.totalItems).toBe(15);
    expect(res.body.meta.currentPage).toBe(1);
    expect(res.body.meta.totalPages).toBe(2);
  });

  it('should return a list of comments with custom pagination', async () => {
    const res = await request(app)
      .get('/api/comments')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        page: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Comments retrieved successfully');
    expect(res.body.data.length).toBe(5);
    expect(res.body.meta.pageSize).toBe(10);
    expect(res.body.meta.totalItems).toBe(15);
    expect(res.body.meta.currentPage).toBe(2);
    expect(res.body.meta.totalPages).toBe(2);
  });

  it('should return a list of comments with custom search', async () => {
    const res = await request(app)
      .get('/api/comments')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        search: 'test10',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Comments retrieved successfully');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.pageSize).toBe(10);
    expect(res.body.meta.totalItems).toBe(1);
    expect(res.body.meta.currentPage).toBe(1);
    expect(res.body.meta.totalPages).toBe(1);
  });
});

describe('POST /api/posts/:postId/comments', () => {
  let post;

  beforeEach(async () => {
    post = await createTestPost();
  });

  afterEach(async () => {
    await removeTestPost();
  });

  it('should return an error if user does not authenticate', async () => {
    const res = await request(app).post(`/api/posts/${post._id}/comments`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token is missing');
  });

  it('should return an error if post is not found', async () => {
    const res = await request(app)
      .post(`/api/posts/${global.validObjectId}/comments`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Post not found');
  });

  it('should return an error if post id is invalid', async () => {
    const res = await request(app)
      .post('/api/posts/invalid-id/comments')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.postId).toBeDefined();
  });

  it('should return an error if input data is invalid', async () => {
    const res = await request(app)
      .post(`/api/posts/${post._id}/comments`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        text: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.text).toBeDefined();
  });

  it('should create a comment if input data is valid', async () => {
    const res = await request(app)
      .post(`/api/posts/${post._id}/comments`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({ text: 'test' });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Comment created successfully');
  });
});

describe('PATCH /api/posts/:postId/comments/:commentId', () => {
  let comment;
  let post;

  beforeEach(async () => {
    comment = await createTestComment();
    post = await createTestPost();
  });

  afterEach(async () => {
    await removeTestComment();
    await removeTestPost();
  });

  it('should return an error if user does not have permission', async () => {
    const res = await request(app)
      .patch(`/api/posts/${post._id}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return an error if post id is invalid', async () => {
    const res = await request(app)
      .patch(`/api/posts/invalid-id/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const res = await request(app)
      .patch(`/api/posts/${global.validObjectId}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Post not found');
  });

  it('should return an error if comment id is invalid', async () => {
    const res = await request(app)
      .patch(`/api/posts/${post._id}/comments/invalid-id`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.commentId).toBeDefined();
  });

  it('should return an error if comment is not found', async () => {
    const res = await request(app)
      .patch(`/api/posts/${post._id}/comments/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Comment not found');
  });

  it('should update comment if input data is valid', async () => {
    const res = await request(app)
      .patch(`/api/posts/${post._id}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        text: 'test1',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Comment updated successfully');
    expect(res.body.data.text).toBe('test1');
  });
});

describe('DELETE /api/posts/:postId/comments/:commentId', () => {
  let comment;
  let post;

  beforeEach(async () => {
    post = await createTestPost();
    comment = await createTestComment();
  });

  afterEach(async () => {
    await removeTestComment();
    await removeTestPost();
  });

  it('should return an error if user is not owned by current user', async () => {
    const res = await request(app)
      .delete(`/api/posts/${post._id}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Permission denied');
  });

  it('should return an error if post id is invalid', async () => {
    const res = await request(app)
      .delete(`/api/posts/invalid-id/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const res = await request(app)
      .delete(`/api/posts/${global.validObjectId}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Post not found');
  });

  it('should return an error if comment id is invalid', async () => {
    const res = await request(app)
      .delete(`/api/posts/${post._id}/comments/invalid-id`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors.commentId).toBeDefined();
  });

  it('should return an error if comment is not found', async () => {
    const res = await request(app)
      .delete(`/api/posts/${post._id}/comments/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Comment not found');
  });

  it('should delete comment if comment id is valid', async () => {
    const res = await request(app)
      .delete(`/api/posts/${post._id}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Comment deleted successfully');
  });
});
