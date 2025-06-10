import ResponseError from '../utils/responseError.js';
import jwt from 'jsonwebtoken';

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new ResponseError('Token is not provided', 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = {
    id: decoded.sub,
    role: decoded.role,
  }
  
  next();
};

export default authenticate;
