import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import express from 'express';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

router.use(authenticate);
router.post('/', authorize('create', 'category'), createCategory);
router.get('/', authorize('read', 'category'), getCategories);
router.get('/:id', authorize('read', 'category'), getCategoryById);
router.put('/:id', authorize('update', 'category'), updateCategory);
router.delete('/:id', authorize('delete', 'category'), deleteCategory);

export default router;
