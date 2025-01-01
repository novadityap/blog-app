import logger from '../utils/logger.js';
import ResponseError from '../utils/responseError.js';

const authorize = (roles) => {
  return async (req, res, next) => {
    try {
      if (roles.includes(req.user.role)) {
        logger.info('permission granted');
        return next();
      };

      logger.warn('permission denied');
      throw new ResponseError('Permission denied', 403);
    } catch (e) {
      next(e);
    }
  };
};

export default authorize;
