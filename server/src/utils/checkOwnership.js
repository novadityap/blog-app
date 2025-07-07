import ResponseError from './responseError.js';
import mongoose from 'mongoose';

const checkOwnership = async ({
  modelName,
  paramsId,
  ownerFieldName,
  currentUser,
}) => {
  if (currentUser.role === 'admin') return;

  if (modelName === 'user') {
    if (currentUser.id === paramsId) return;
    throw new ResponseError('Permission denied', 403);
  }

  const Model = mongoose.model(modelName.charAt(0).toUpperCase() + modelName.slice(1));

  const resource = await Model.findById(paramsId).select(ownerFieldName);
  if (!resource) {
    throw new ResponseError(
      `${modelName.charAt(0).toUpperCase() + modelName.slice(1)} not found`,
      404
    );
  }

  if (resource[ownerFieldName]?.toString() === currentUser.id) return;

  throw new ResponseError('Permission denied', 403);
};

export default checkOwnership;
