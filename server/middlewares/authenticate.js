import ResponseError from '../utils/responseError.js';
import logger from '../utils/logger.js';
import jwt from 'jsonwebtoken';
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      logger.info('unauthorized - no access token provided');
      throw new ResponseError('Token is not provided', 401);
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);

    next();
  } catch (e) {
    next(e);
  }
};

export default authenticate;
