import ResponseError from './responseError.js';

const checkOwnership = async (model, paramsId, currentUser) => {
    const isAdmin = currentUser.role === 'admin';

    if (model.modelName === 'User') {
      if (isAdmin || currentUser.id === paramsId) return;
      throw new ResponseError('Permission denied', 403);
    }

    const resource = await model.findById(paramsId);
    if (!resource) {
      throw new ResponseError(
        `${model.modelName.charAt(0).toUpperCase() + model.modelName.slice(1)} not found`,
        404
      );
    }

    const isOwner = resource.user.toString() === currentUser.id;
    if (isAdmin || isOwner) return;

    throw new ResponseError('Permission denied', 403);
};

export default checkOwnership;
