import logger from '../utils/logger.js';
import loadModel from '../utils/loadModel.js';
import isValidObjectId from '../utils/validateObjectId.js';
import ResponseError from '../utils/responseError.js';

const checkOwnership = resource => async (req, res, next) => {
  try {
    const isAdmin = req.user.roles.includes('admin');

    if (!isValidObjectId(req.params.id)) {
      logger.warn('validation errors');
      throw new ResponseError('Validation errors', 400, {
        id: [`Invalid ${resource} id`],
      });
    }

    if (resource === 'user') {
      if (isAdmin || req.user.id === req.params.id) return next();

      logger.warn('permission denied');
      throw new ResponseError('Permission denied', 403);
    }

    const Model = await loadModel(resource);
    const resourceInstance = await Model.findById(req.params.id);

    if (!resourceInstance) {
      logger.warn(`${resource} not found`);
      throw new ResponseError(
        `${resource.charAt(0).toUpperCase() + resource.slice(1)} not found`,
        404
      );
    }

    const hasOwnership = resourceInstance.userId.toString() === req.user.id;

    if (isAdmin || hasOwnership) return next();

    logger.warn('permission denied');
    throw new ResponseError('Permission denied', 403);
  } catch (e) {
    next(e);
  }
};

export default checkOwnership;
