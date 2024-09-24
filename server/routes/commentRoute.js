import {
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

router.use(authenticate);
router.get('/', authorize('read', 'comment'), getComments);
router.put('/:id', authorize('update', 'comment'), updateComment);
router.delete('/:id', authorize('delete', 'comment'), deleteComment);
router.put('/:id/like', authorize('update', 'comment'), likeComment);
router.put('/:id/unlike', authorize('update', 'comment'), unlikeComment);

export default router;