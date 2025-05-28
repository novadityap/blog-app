import ResponseError from '../utils/responseError.js';
import jwt from 'jsonwebtoken';
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new ResponseError('Token is not provided', 401);

  req.user = jwt.verify(token, process.env.JWT_SECRET);
  next();
};

export default authenticate;
