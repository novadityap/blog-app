import express from 'express';
import categoryController from '../controllers/categoryController.js';
import commentController from '../controllers/commentController.js';
import postController from '../controllers/postController.js';
import dashboardController from '../controllers/dashboardController.js';
import permissionController from '../controllers/permissionController.js';
import roleController from '../controllers/roleController.js';
import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';
import authorize from '../middlewares/authorize.js';
import authenticate from '../middlewares/authenticate.js';

const apiRouter = express.Router();

// Public API
apiRouter.post('/auth/signup', authController.signup);
apiRouter.post('/auth/verify-email/:token', authController.verifyEmail);
apiRouter.post('/auth/resend-verification', authController.resendVerification);
apiRouter.post('/auth/signin', authController.signin);
apiRouter.post('/auth/request-reset-password', authController.requestResetPassword);
apiRouter.post('/auth/reset-password/:token', authController.resetPassword);

apiRouter.get('/categories/list', categoryController.list);

apiRouter.get('/posts', postController.search);
apiRouter.get('/posts/:postId', postController.show);


apiRouter.use(authenticate);

// Auth API
apiRouter.post('/auth/refresh-token', authController.refreshToken);
apiRouter.post('/auth/signout', authController.signout);

// Category API
apiRouter.post('/categories', authorize('create_category'), categoryController.create);
apiRouter.get('/categories', authorize('search_category'), categoryController.search);
apiRouter.get('/categories/:categoryId', categoryController.show);
apiRouter.put('/categories/:categoryId', authorize('update_category'), categoryController.update);
apiRouter.delete('/categories/:categoryId', authorize('remove_category'), categoryController.remove
);

// Comment API
apiRouter.get('/comments', authorize('search_comment'), commentController.search);
apiRouter.post('/posts/:postId/comments', authorize('create_comment'), commentController.create);
apiRouter.get('/posts/:postId/comments/:commentId', authorize('show_comment'), commentController.show);
apiRouter.patch('/posts/:postId/comments/:commentId', authorize('update_comment'), commentController.update);
apiRouter.delete('/posts/:postId/comments/:commentId', authorize('remove_comment'), commentController.remove);

// Post API
apiRouter.post('/posts', authorize('create_post'), postController.create);
apiRouter.put('/posts/:postId', authorize('update_post'), postController.update);
apiRouter.patch('/posts/:postId/like', authorize('like_post'), postController.like);
apiRouter.delete('/posts/:postId', authorize('remove_post'), postController.remove);

// Dashboard API
apiRouter.get('/dashboard/', authorize('stats_dashboard'), dashboardController.stats);

// Permission API
apiRouter.get('/permissions/list', authorize('list_permission'), permissionController.list);

// Role API
apiRouter.post('/roles', authorize('create_role'), roleController.create);
apiRouter.get('/roles', authorize('search_role'), roleController.search);
apiRouter.get('/roles/:roleId', authorize('show_role'), roleController.show);
apiRouter.put('/roles/:roleId', authorize('update_role'), roleController.update);
apiRouter.delete('/roles/:roleId', authorize('remove_role'), roleController.remove);

// User API
apiRouter.get('/users/', authorize('search_user'), userController.search);
apiRouter.post('/users/', authorize('create_user'), userController.create);
apiRouter.get('/users/:userId', authorize('show_user'), userController.show);
apiRouter.put('/users/:userId', authorize('update_user'), userController.update);
apiRouter.delete('/users/:userId', authorize('remove_user'), userController.remove);

export default apiRouter;