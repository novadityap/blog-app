import mongoose from 'mongoose';

const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export default validateObjectId;