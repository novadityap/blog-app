import {
  createPermission,
  getPermissions,
  getPermissionById,
  updatePermission,
  deletePermission
} from "../controllers/permissionController.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import express from "express";

const router = express.Router();

router.use(authenticate);
router.post('/', authorize('create', 'permission'), createPermission);
router.get('/', authorize('read', 'permission'), getPermissions);
router.get('/:id', authorize('read', 'permission'), getPermissionById);
router.put('/:id', authorize('update', 'permission'), updatePermission);
router.delete('/:id', authorize('delete', 'permission'), deletePermission);

export default router;