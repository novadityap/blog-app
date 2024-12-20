import Role from '../models/roleModel.js';
import logger from '../utils/logger.js';
import ResponseError from '../utils/responseError.js';

const authorize = (permission) => {
  return async (req, res, next) => {
    const { roles: currentUserRoles } = req.user;

    try {
      const roles = await Role.find({ 
      name : { $in: currentUserRoles } }).populate('permissions');

      const hasPermission = roles.some(role =>
        role.permissions.some(rolePermission => rolePermission.name === permission)
      );
      if (!hasPermission) {
        logger.warn('permission denied');
        throw new ResponseError('Permission denied', 403);
      };

      return next();
    } catch (e) {
      next(e);
    }
  };
};

export default authorize;
