import logger from '../utils/logger.js';
import ResponseError from '../utils/responseError.js';

const authorize = requiredRoles => {
  return async (req, res, next) => {
    if (requiredRoles.includes(req.user.role)) {
      logger.info('permission granted');
      return next();
    }

    throw new ResponseError('Permission denied', 403);
  };
};

export default authorize;
