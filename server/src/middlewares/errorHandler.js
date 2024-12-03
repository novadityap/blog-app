import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  const {
    code = 500,
    message = 'Internal server Error',
    errors,
    data,
    stack,
  } = err;

  const logMethod = code >= 500 ? 'error' : 'warn';
  logger.log(logMethod, message, { stack, ...req.metadata });

  if (err instanceof jwt.TokenExpiredError || err instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({
      code: 401,
      message: 'Token expired',
    });
  }

  const response = { code, message };

  if (code === 400 && errors) {
    response.errors = errors;
  } else if (code === 404) {
    response.data = data;
  }

  res.status(code).json(response);
};

export default errorHandler;
