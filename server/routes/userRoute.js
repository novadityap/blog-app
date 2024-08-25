import {
  getUserById,
  createUser,
} from '../controllers/userController.js';
import express from 'express';

const router = express.Router();

router.get('/:id', getUserById);
router.post('', createUser);

export default router;