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
apiRouter.post('/api/auth/signup', authController.signup);
apiRouter.post('/api/auth/verify-email/:token', authController.verifyEmail);
apiRouter.post('/api/auth/resend-verification', authController.resendVerification);
apiRouter.post('/api/auth/signin', authController.signin);
apiRouter.post('/api/auth/request-reset-password', authController.requestResetPassword);
apiRouter.post('/api/auth/reset-password/:token', authController.resetPassword);

apiRouter.get('/api/categories/list', categoryController.list);

apiRouter.get('/api/posts', postController.search);
apiRouter.get('/api/posts/:postId', postController.show);


apiRouter.use(authenticate);

// Auth API
apiRouter.post('/api/auth/refresh-token', authController.refreshToken);
apiRouter.post('/api/auth/signout', authController.signout);

// Category API
apiRouter.post('/api/categories', authorize('create_category'), categoryController.create);
apiRouter.get('/api/categories', authorize('search_category'), categoryController.search);
apiRouter.get('/api/categories/:categoryId', categoryController.show);
apiRouter.put('/api/categories/:categoryId', authorize('update_category'), categoryController.update);
apiRouter.delete('/api/categories/:categoryId', authorize('remove_category'), categoryController.remove
);

// Comment API
apiRouter.get('/api/comments', authorize('search_comment'), commentController.search);
apiRouter.post('/api/posts/:postId/comments', authorize('create_comment'), commentController.create);
apiRouter.get('/api/posts/:postId/comments/:commentId', authorize('show_comment'), commentController.show);
apiRouter.patch('/api/posts/:postId/comments/:commentId', authorize('update_comment'), commentController.update);
apiRouter.delete('/api/posts/:postId/comments/:commentId', authorize('remove_comment'), commentController.remove);

// Post API
apiRouter.post('/api/posts', authorize('create_post'), postController.create);
apiRouter.put('/api/posts/:postId', authorize('update_post'), postController.update);
apiRouter.patch('/api/posts/:postId/like', authorize('like_post'), postController.like);
apiRouter.delete('/api/posts/:postId', authorize('remove_post'), postController.remove);

// Dashboard API
apiRouter.get('/api/dashboard/', authorize('stats_dashboard'), dashboardController.stats);

// Permission API
apiRouter.get('/api/permissions/list', authorize('list_permission'), permissionController.list);

// Role API
apiRouter.post('/api/roles', authorize('create_role'), roleController.create);
apiRouter.get('/api/roles', authorize('search_role'), roleController.search);
apiRouter.get('/api/roles/:roleId', authorize('show_role'), roleController.show);
apiRouter.put('/api/roles/:roleId', authorize('update_role'), roleController.update);
apiRouter.delete('/api/roles/:roleId', authorize('remove_role'), roleController.remove);

// User API
apiRouter.get('/api/users/', authorize('search_user'), userController.search);
apiRouter.post('/api/users/', authorize('create_user'), userController.create);
apiRouter.get('/api/users/:userId', authorize('show_user'), userController.show);
apiRouter.put('/api/users/:userId', authorize('update_user'), userController.update);
apiRouter.delete('/api/users/:userId', authorize('remove_user'), userController.remove);

export default apiRouter;