import {
  createPost
} from '../controllers/postController.js';
import Post from '../models/postModel.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorizeMiddleware from '../middlewares/authorizeMiddleware.js';
import express from 'express';

const router = express.Router();

router.use(authMiddleware);
router.post('', authorizeMiddleware(['admin']), createPost);

export default router;