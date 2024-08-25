import {
  getUserById,
  getAllUsers,
  createUser,
} from '../controllers/userController.js';
import express from 'express';

const router = express.Router();

router.get('', getAllUsers);
router.post('', createUser);
router.get('/:id', getUserById);

export default router;