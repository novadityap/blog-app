import {
  getUserById,
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import express from 'express';

const router = express.Router();

router.use(authenticate);
router.get('/', authorize('read', 'user'), getUsers);
router.post('/', authorize('create', 'user'), createUser);
router.get('/:id', authorize('read', 'user'), getUserById);
router.put('/:id', authorize('update', 'user'), updateUser);
router.delete('/:id', authorize('delete', 'user'), deleteUser);

export default router;