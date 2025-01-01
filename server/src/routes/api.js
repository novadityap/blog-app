import express from 'express';
import categoryController from '../controllers/categoryController.js';
import commentController from '../controllers/commentController.js';
import postController from '../controllers/postController.js';
import dashboardController from '../controllers/dashboardController.js';
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
apiRouter.post('/categories', authorize(['admin']), categoryController.create);
apiRouter.get('/categories', authorize(['admin']), categoryController.search);
apiRouter.get('/categories/:categoryId', authorize(['admin']), categoryController.show);
apiRouter.put('/categories/:categoryId', authorize(['admin']), categoryController.update);
apiRouter.delete('/categories/:categoryId', authorize(['admin']), categoryController.remove
);

// Comment API
apiRouter.get('/comments', authorize(['admin']), commentController.search);
apiRouter.post('/posts/:postId/comments', authorize(['admin', 'user']), commentController.create);
apiRouter.get('/posts/:postId/comments/:commentId', authorize(['admin']), commentController.show);
apiRouter.patch('/posts/:postId/comments/:commentId', authorize(['admin']), commentController.update);
apiRouter.delete('/posts/:postId/comments/:commentId', authorize(['admin', 'user']), commentController.remove);

// Post API
apiRouter.post('/posts', authorize(['admin']), postController.create);
apiRouter.put('/posts/:postId', authorize(['admin']), postController.update);
apiRouter.patch('/posts/:postId/like', authorize(['admin', 'user']), postController.like);
apiRouter.delete('/posts/:postId', authorize(['admin']), postController.remove);

// Dashboard API
apiRouter.get('/dashboard', authorize(['admin']), dashboardController.stats);

// Role API
apiRouter.post('/roles', authorize(['admin']), roleController.create);
apiRouter.get('/roles', authorize(['admin']), roleController.search);
apiRouter.get('/roles/list', authorize(['admin']), roleController.list);
apiRouter.get('/roles/:roleId', authorize(['admin']), roleController.show);
apiRouter.put('/roles/:roleId', authorize(['admin']), roleController.update);
apiRouter.delete('/roles/:roleId', authorize(['admin']), roleController.remove);

// User API
apiRouter.get('/users/', authorize(['admin']), userController.search);
apiRouter.post('/users/', authorize(['admin']), userController.create);
apiRouter.get('/users/:userId', authorize(['admin', 'user']), userController.show);
apiRouter.put('/users/:userId', authorize(['admin', 'user']), userController.update);
apiRouter.delete('/users/:userId', authorize(['admin']), userController.remove);

export default apiRouter;