import {
  signup,
  emailVerification,
  resendEmailVerification,
  signin,
  signout,
  refreshToken,
  requestResetPassword,
  resetPassword
} from '../controllers/authController.js';
import express from 'express';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/email-verification/:token', emailVerification);
router.post('/resend-email-verification', resendEmailVerification);
router.post('/signin', signin);
router.post('/signout', authenticate, signout);
router.post('/refresh-token', refreshToken);
router.post('/request-reset-password', requestResetPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
