import logger from './logger.js';
import ResponseError from './responseError.js';

const checkOwnership = async (model, paramsId, currentUser) => {
    const isAdmin = currentUser.roles.includes('admin');

    if (model.modelName === 'User') {
      if (isAdmin || currentUser.id === paramsId) return;

      logger.warn('permission denied');
      throw new ResponseError('Permission denied', 403);
    }

    const resource = await model.findById(paramsId);
    if (!resource) {
      logger.warn(`${model.modelName} not found`);
      throw new ResponseError(
        `${model.modelName.charAt(0).toUpperCase() + model.modelName.slice(1)} not found`,
        404
      );
    }

    const isOwner = resource.userId.toString() === currentUser.id;
    if (isAdmin || isOwner) return;

    logger.warn('permission denied');
    throw new ResponseError('Permission denied', 403);
};

export default checkOwnership;
