import {
  signup,
  emailVerification,
  resendEmailVerification,
  signin,
  signout,
  refreshToken,
} from '../controllers/authController.js';
import authorizeMiddleware from '../middlewares/authorizeMiddleware.js';
import express from 'express';

const router = express.Router();

router.post('/signup', signup);
router.post('/email-verification/:verificationToken', emailVerification);
router.post('/resend-email-verification', resendEmailVerification);
router.post('/signin', signin);
router.post('/signout', authorizeMiddleware(['admin', 'user']), signout);
router.post('/refresh-token', refreshToken);

export default router;
