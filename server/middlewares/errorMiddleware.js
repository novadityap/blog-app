import ResponseError from '../utils/responseError.js';
import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';
import isJson from '../utils/isJson.js';

const errorMiddleware = (err, req, res, next) => {
  const isBadRequest = err.status === 400;
  const isJwtExpired = err instanceof jwt.TokenExpiredError;
  const isJwtError = err instanceof jwt.JsonWebTokenError;

  if (isBadRequest) {
    if (isJson(err.message)) return res.status(err.status).json({ error: JSON.parse(err.message) });
    return res.status(err.status).json({ error: err.message });
  } else if (err instanceof ResponseError && !isBadRequest) {
    return res.status(err.status).json({ error: err.message });
  } else if (isJwtExpired || isJwtError) {
    logger.info(`Token is invalid or expired: ${err.message}`);
    return res.status(401).json({ error: 'Token is invalid or expired' });
  } else {
    logger.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default errorMiddleware;
