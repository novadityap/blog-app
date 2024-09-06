import ResponseError from '../utils/responseError.js';
import logger from '../utils/logger.js';
import User from '../models/userModel.js';
import Post from '../models/postModel.js';

const authorizeMiddleware = (allowedRoles, model, checkOwnership = false) => {
  return async (req, res, next) => {
    try {
      const { currentUserId, currentUserRole } = req.user;

      if (!allowedRoles.includes(currentUserRole)) {
        logger.info(`forbidden - user role ${currentUserRole} is not allowed`);
        throw new ResponseError(
          `You don't have permission to access this resource`,
          403
        );
      }

      if (checkOwnership) {
        const resourceId = req.params.id;
        const resource = await model.findById(resourceId);

        if (!resource) {
          logger.info(
            `${model.toLowerCase()} not found - ${model.toLowerCase()} not found with id ${resourceId}`
          );
          throw new ResponseError(`${model} not found`, 404);
        }

        if (resource.userId.toString() !== currentUserId) {
          logger.info(
            `access denied - user id ${currentUserId} is not equal to ${model.toLowerCase()} owner id ${
              resource.userId
            }`
          );
          throw new ResponseError(
            `You don't have permission to access this ${model.toLowerCase()}`,
            403
          );
        }
      }

      next();
    } catch (e) {
      next(e);
    }
  };
};

export default authorizeMiddleware;
