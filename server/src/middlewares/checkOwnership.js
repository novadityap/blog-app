import logger from '../utils/logger.js';
import loadModel from '../utils/loadModel.js';
import isValidObjectId from '../utils/validateObjectId.js';
import ResponseError from '../utils/responseError.js';

const checkOwnership = resource => async (req, res, next) => {
  try {
    const isAdmin = req.user.roles.includes('admin');

    if (!isValidObjectId(req.params.id)) {
      logger.warn(
        `permission denied - invalid or malformed ${resource} id ${req.params.id}`
      );
      throw new ResponseError('Validation errors', 400, {
        id: [`Invalid or malformed ${resource} id`],
      });
    }

    if (resource === 'user') {
      if (isAdmin || req.user.id === req.params.id) return next();

      logger.warn(
        `permission denied - user ${req.user.id} does not have permission to access ${resource} with id ${req.params.id}`
      );
      throw new ResponseError('Permission denied', 403);
    }

    const Model = await loadModel(resource);
    if (!Model) {
      logger.warn(`permission denied - resource ${resource} is not supported`);
      throw new ResponseError('Internal server error', 500);
    }

    const resourceInstance = await Model.findById(req.params.id);
    if (!resourceInstance) {
      logger.warn(
        `permission denied - resource ${resource} with id ${req.params.id} not found`
      );
      throw new ResponseError(
        `${resource.charAt(0).toUpperCase() + resource.slice(1)} not found`,
        404
      );
    }

    const hasOwnership = resource === 'comment'
      ? resourceInstance.likes.includes(req.user.id)
      : resourceInstance.userId.toString() === req.user.id;

    if (isAdmin || hasOwnership) 
      return next();

    logger.info(
      `permission denied - user ${req.user.id} does not have permission to access ${resource} with id ${req.params.id}`
    );
    throw new ResponseError('Permission denied', 403);
  } catch (e) {
    next(e);
  }
};

export default checkOwnership;
