import logger from "../utils/logger.js";
import loadModel from "../utils/loadModel.js";
import isValidObjectId from "../utils/validateObjectId.js";

const checkOwnership = (resource) => async (req, res, next) => {
  try {
    const isAdmin = req.user.roles.includes('admin');

    if (!isValidObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed ${resource} id ${req.params.id}`);
      throw new ResponseError('Invalid id', 400, { id: [`Invalid or malformed ${resource} id`] });
    }

    if (resource === 'user') {
      if (isAdmin || req.user.id === req.params.id) return next();

      logger.info(`permission denied - user ${req.user.id} does not have permission to access ${resource} with id ${req.params.id}`);
      throw new ResponseError('Permission denied', 403);
    }

    const Model = loadModel(resource);

    if (!Model) {
      logger.info(`resource not found - resource ${resource} is not supported`);
      throw new ResponseError('Internal server error', 500,);
    }

    const resourceInstance = await Model.findById(req.params.id);

    if (!resourceInstance) {
      logger.info(`resource not found - resource ${resource} with id ${req.params.id} not found`);
      throw new ResponseError('Resource not found', 404);
    }

    if (isAdmin || req.user.id === resourceInstance.userId.toString()) return next();

    logger.info(`permission denied - user ${req.user.id} does not have permission to access ${resource} with id ${req.params.id}`);
    throw new ResponseError('Permission denied', 403);
  } catch (err) { 
    next(err);
  }
}

export default checkOwnership;