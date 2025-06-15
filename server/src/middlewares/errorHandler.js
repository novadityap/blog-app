import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  const {
    code = 500,
    message = 'Internal server Error',
    errors,
    stack,
  } = err;

  if (process.env.NODE_ENV === 'development') {
    logger.log(code >= 500 ? 'error' : 'warn', message.toLowerCase(), { stack, ...req.metadata });
  } else {
    logger.log(code >= 500 ? 'error' : 'warn', message.toLowerCase(), { ...req.metadata });
  }

  if (err instanceof jwt.JsonWebTokenError) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: 'Token has expired' });
    }

    return res.status(401).json({ code: 401, message: 'Token is invalid' });
  }

  const response = {
    code,
    message: code >= 500 ? 'Internal server error' : message,
    ...(code === 400 && { errors }),
    ...(code === 404 && { data : null }),
    ...(process.env.NODE_ENV === 'development' && code >= 500 && { stack }),
  };

  res.status(code).json(response);
};

export default errorHandler;
