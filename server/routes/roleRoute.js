import {
  createRole,
  getRoles, 
  getRoleById,
  updateRole,
  deleteRole
} from '../controllers/roleController.js';
import express from 'express';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

router.post('/', authorize('create', 'role'), createRole);
router.get('/', authorize('read', 'role'), getRoles);
router.get('/:id', authorize('read', 'role'), getRoleById);
router.put('/:id', authorize('update', 'role'), updateRole);
router.delete('/:id', authorize('delete', 'role'), deleteRole);

export default router;
