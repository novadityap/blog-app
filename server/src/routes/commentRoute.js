import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment
} from '../controllers/commentController.js';
import express from 'express';
import authorize from '../middlewares/authorize.js';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/', getComments);

router.use(authenticate);
router.post('/:postId', authorize('create', 'comment'), createComment);
router.put('/:postId/:commentId', authorize('update', 'comment'), updateComment);
router.delete('/:postId/:commentId', authorize('delete', 'comment'), deleteComment);
router.put('/:postId/:commentId/like', authorize('update', 'comment'), likeComment);
router.put('/:postId/:commentId/unlike', authorize('update', 'comment'), unlikeComment);

export default router;