import ResponseError from '../utils/responseError.js';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const sendErrorResponse = (res, code, message, errors = null, data = null) => {
  const response = { code, message, errors, data };
  
  if (!errors) delete response.errors;
  if (!data) delete response.data;
  
  logger.error(`${code} - ${message}`);
  return res.status(code).json(response);
};

const handleError = (err, req, res, next) => {
  const { code = 500, message = 'Internal server Error', errors = null, data = null } = err;

  if (err instanceof jwt.TokenExpiredError || err instanceof jwt.JsonWebTokenError) {
    logger.info(`Token error - ${err.message}`);
    return sendErrorResponse(res, 401, 'Token is invalid or expired');
  }

  if (err instanceof ResponseError && code !== 500) {
    return sendErrorResponse(res, code, message);
  }

  switch (code) {
    case 400:
      return sendErrorResponse(res, code, message, errors);
    case 404:
      return sendErrorResponse(res, code, message, null, data);
    case 409:
      return sendErrorResponse(res, code, message, errors);
    default:
      break;
  }

  logger.error(err);
  return sendErrorResponse(res, 500, 'Internal server error');
};

export default handleError;