import Role from '../models/roleModel.js';
import logger from '../utils/logger.js';
import ResponseError from '../utils/responseError.js';
import User from '../models/userModel.js';
import Post from '../models/postModel.js';
import Comment from '../models/commentModel.js';

const resourceModelMap = {
  user: User,
  comment: Comment,
  post: Post
};

const checkOwner = async (resource, resourceId, currentUserId) => {
  if (resource === 'user') {
    if (resourceId !== currentUserId) {
      logger.info(`check owner failed - user ${currentUserId} is not the owner of resource ${resource} with id ${resourceId}`);
      throw new ResponseError('Permission denied', 403);
    }

    return true;
  }

  const Model = resourceModelMap[resource];

  if (!Model) {
    logger.info(`check owner failed - resource ${resource} is not supported`);
    throw new ResponseError('Resource not supported', 400, { resource: ['Resource not supported'] });
  }

  const resourceInstance = await Model.findById(resourceId);

  if (!resourceInstance) {
    logger.info(`check owner failed - resource ${resource} not found with id ${resourceId}`);
    throw new ResponseError(`${resource.charAt(0).toUpperCase() + resource.slice(1)} not found`, 404);
  }

  if (resourceInstance.userId.toString() !== currentUserId) {
    logger.info(`check owner failed - user ${currentUserId} is not the owner of resource ${resource} with id ${resourceId}`);
    throw new ResponseError('Permission denied', 403);
  }

  return true;
}


const authorize = (action, resource, checkOwnerFlag = false) => {
  return async (req, res, next) => {
    const { id: currentUserId, roles: currentUserRoles } = req.user;

    try {
      const roles = await Role.find({ _id: { $in: currentUserRoles } }).populate('permissions');

      const hasPermission = roles.some(role =>
        role.permissions.some(
          permission =>
            permission.action === action && permission.resource === resource
        )
      );

      if (hasPermission) {
        const isAdmin = roles.some(role => role.name === 'admin');

        if (checkOwnerFlag && !isAdmin) {
          await checkOwner(resource, req.params.id, currentUserId);
        }

        return next();
      }

      logger.info(
        `permission denied - user ${currentUserId} does not have permission to ${action} ${resource}`
      );
      throw new ResponseError('Permission denied', 403);
    } catch (err) {
      next(err);
    }
  };
};

export default authorize;
