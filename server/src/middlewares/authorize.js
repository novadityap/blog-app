import Role from '../models/roleModel.js';
import logger from '../utils/logger.js';
import ResponseError from '../utils/responseError.js';

const authorize = (action, resource) => {
  return async (req, res, next) => {
    const { id: currentUserId, roles: currentUserRoles } = req.user;

    try {
      const roles = await Role.find({ 
      name : { $in: currentUserRoles } }).populate('permissions');

      const hasPermission = roles.some(role =>
        role.permissions.some(
          permission =>
            permission.action === action && permission.resource === resource
        )
      );

      if (!hasPermission) {
        logger.info(
          `permission denied - user ${currentUserId} does not have permission to ${action} ${resource}`
        );
        throw new ResponseError('Permission denied', 403);
      };

      return next();
    } catch (e) {
      next(e);
    }
  };
};

export default authorize;
