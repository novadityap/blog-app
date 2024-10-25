import postController from '../controllers/postController.js';
import authorize from '../middlewares/authorize.js';
import authenticate from '../middlewares/authenticate.js';
import queryHandler from '../middlewares/queryHandler.js';
import express from 'express';

const router = express.Router();

router.get('/', queryHandler, postController.getAll);
router.get('/:id', postController.getById);

router.use(authenticate);
router.post('/', authorize('create', 'post'), postController.create);
router.patch('/:id', authorize('update', 'post'), postController.update);
router.delete('/:id', authorize('delete', 'post'), postController.remove);

export default router;