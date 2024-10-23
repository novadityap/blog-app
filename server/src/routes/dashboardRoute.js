import express from 'express';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import { getDashboardData } from '../controllers/dashboardController.js';

const router = express.Router();

router.use(authenticate);
router.get('/', authorize('read', 'dashboard'), getDashboardData);

export default router;