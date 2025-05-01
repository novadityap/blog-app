import request from 'supertest';
import app from '../src/app.js';
import {
  createTestComment,
  createManyTestComments,
  removeTestComment,
  createTestPost,
  removeTestPost,
} from './testUtil.js';

describe('GET /api/posts/:postId/comments', () => {
  let post;

  beforeEach(async () => {
    post = await createTestPost();
  });

  afterEach(async () => {
    await removeTestPost();
  });

  it('should return an empty list if post has no comments', async () => {
    const result = await request(app)
      .get(`/api/posts/${post._id}/comments`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('No comments found');
    expect(result.body.data).toHaveLength(0);
  });

  it('should return comments if post id is valid', async () => {
    const comment = await createTestComment({ post: post._id });

    const result = await request(app)
      .get(`/api/posts/${post._id}/comments`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Comments retrieved successfully');
    expect(result.body.data).toHaveLength(1);
    expect(result.body.data[0]._id).toEqual(comment._id.toString());

    await removeTestComment();
  });
});

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
    const result = await request(app)
      .get(`/api/posts/${post._id}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if post id is invalid', async () => {
    const result = await request(app)
      .delete(`/api/posts/invalid-id/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const result = await request(app)
      .delete(`/api/posts/${global.validObjectId}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Post not found');
  });

  it('should return an error if comment id is invalid', async () => {
    const result = await request(app)
      .delete(`/api/posts/${post._id}/comments/invalid-id`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.commentId).toBeDefined();
  });

  it('should return an error if comment is not found', async () => {
    const result = await request(app)
      .delete(`/api/posts/${post._id}/comments/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Comment not found');
  });

  it('should return a comment if comment id is valid', async () => {
    const result = await request(app)
      .get(`/api/posts/${post._id}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Comment retrieved successfully');
  });
});

describe('GET /api/comments/search', () => {
  beforeEach(async () => {
    await createManyTestComments();
  });

  afterEach(async () => {
    await removeTestComment();
  });

  it('should return an error if user does not have permission', async () => {
    const result = await request(app)
      .get('/api/comments/search')
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return a list of comments with default pagination', async () => {
    const result = await request(app)
      .get('/api/comments/search')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Comments retrieved successfully');
    expect(result.body.data).toHaveLength(10);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBe(15);
    expect(result.body.meta.currentPage).toBe(1);
    expect(result.body.meta.totalPages).toBe(2);
  });

  it('should return a list of comments with custom pagination', async () => {
    const result = await request(app)
      .get('/api/comments/search')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        page: 2,
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Comments retrieved successfully');
    expect(result.body.data.length).toBe(5);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBe(15);
    expect(result.body.meta.currentPage).toBe(2);
    expect(result.body.meta.totalPages).toBe(2);
  });

  it('should return a list of comments with custom search', async () => {
    const result = await request(app)
      .get('/api/comments/search')
      .set('Authorization', `Bearer ${global.adminToken}`)
      .query({
        q: 'test10',
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Comments retrieved successfully');
    expect(result.body.data).toHaveLength(1);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBe(1);
    expect(result.body.meta.currentPage).toBe(1);
    expect(result.body.meta.totalPages).toBe(1);
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
    const result = await request(app).post(`/api/posts/${post._id}/comments`);

    expect(result.status).toBe(401);
    expect(result.body.message).toBe('Token is not provided');
  });

  it('should return an error if post is not found', async () => {
    const result = await request(app)
      .post(`/api/posts/${global.validObjectId}/comments`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Post not found');
  });

  it('should return an error if post id is invalid', async () => {
    const result = await request(app)
      .post('/api/posts/invalid-id/comments')
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.postId).toBeDefined();
  });

  it('should return an error if input data is invalid', async () => {
    const result = await request(app)
      .post(`/api/posts/${post._id}/comments`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        text: '',
      });

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.text).toBeDefined();
  });

  it('should create a comment if input data is valid', async () => {
    const result = await request(app)
      .post(`/api/posts/${post._id}/comments`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({ text: 'test' });

    expect(result.status).toBe(201);
    expect(result.body.message).toBe('Comment created successfully');
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
    const result = await request(app)
      .patch(`/api/posts/${post._id}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if post id is invalid', async () => {
    const result = await request(app)
      .patch(`/api/posts/invalid-id/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const result = await request(app)
      .patch(`/api/posts/${global.validObjectId}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Post not found');
  });

  it('should return an error if comment id is invalid', async () => {
    const result = await request(app)
      .patch(`/api/posts/${post._id}/comments/invalid-id`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.commentId).toBeDefined();
  });

  it('should return an error if comment is not found', async () => {
    const result = await request(app)
      .patch(`/api/posts/${post._id}/comments/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Comment not found');
  });

  it('should update comment if input data is valid', async () => {
    const result = await request(app)
      .patch(`/api/posts/${post._id}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`)
      .send({
        text: 'test1',
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Comment updated successfully');
    expect(result.body.data.text).toBe('test1');
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
    const result = await request(app)
      .delete(`/api/posts/${post._id}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if post id is invalid', async () => {
    const result = await request(app)
      .delete(`/api/posts/invalid-id/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const result = await request(app)
      .delete(`/api/posts/${global.validObjectId}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Post not found');
  });

  it('should return an error if comment id is invalid', async () => {
    const result = await request(app)
      .delete(`/api/posts/${post._id}/comments/invalid-id`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.commentId).toBeDefined();
  });

  it('should return an error if comment is not found', async () => {
    const result = await request(app)
      .delete(`/api/posts/${post._id}/comments/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Comment not found');
  });

  it('should delete comment if comment id is valid', async () => {
    const result = await request(app)
      .delete(`/api/posts/${post._id}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.adminToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Comment deleted successfully');
  });
});
