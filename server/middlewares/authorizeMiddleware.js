import ResponseError from '../utils/responseError.js';
import logger from '../utils/logger.js';

const authorizeMiddleware = (allowedRoles, model, checkOwnership = false) => {
  return async (req, res, next) => {
    try {
      const { id: currentUserId, role: currentUserRole } = req.user;

      if (!allowedRoles.includes(currentUserRole)) {
        logger.info(`forbidden - user role ${currentUserRole} is not allowed`);
        throw new ResponseError(
          `You don't have permission to access this resource`,
          403
        );
      }

      if (checkOwnership) {
        const resourceId = req.params.id;
        const resourceName = req.originalUrl.split('/')[2].replace(/s$/, '');
        const resource = await model.findById(resourceId);

        if (!resource) {
          logger.info(
            `${resourceName} not found - ${resourceName} not found with id ${resourceId}`
          );
          throw new ResponseError(`${resourceName} not found`, 404);
        }

        if (currentUserId !== resourceId && currentUserRole !== 'admin') {
          logger.info(
            `forbidden - user ${currentUserId} is not allowed to access ${resourceName} with id ${resourceId}`
          );
          throw new ResponseError(
            `You don't have permission to access this ${resourceName}`,
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
