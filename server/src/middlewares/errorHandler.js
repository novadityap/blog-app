import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  const {
    code = 500,
    message = 'Internal server Error',
    errors,
    stack,
  } = err;

  if (err instanceof jwt.JsonWebTokenError) {
    logger.warn('token is invalid');
    return res.status(401).json({ code: 401, message: 'Token is invalid' });
  }

  if (err instanceof jwt.TokenExpiredError) {
    logger.warn('token has expired');
    return res.status(401).json({ code: 401, message: 'Token has expired' });
  }

  logger.log(code >= 500 ? 'error' : 'warn', message, { stack, ...req.metadata });

  const response = {
    code,
    message: code >= 500 ? 'Internal server error' : message,
    ...(code === 400 && { errors }),
    ...(code === 409 && { errors }),
    ...(code === 404 && { data : null }),
    ...(process.env.NODE_ENV === 'development' && code >= 500 && { stack }),
  };

  res.status(code).json(response);
};

export default errorHandler;
