import ResponseError from '../utils/responseError.js';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const handleError = (err, req, res, next) => {
  const { code = 500, message = 'Internal server Error', errors = null, data = null } = err;
  
    if (err instanceof jwt.TokenExpiredError || err instanceof jwt.JsonWebTokenError) {
      logger.info(`Token error - ${err.message}`);
      return res.status(401).json({ 
        code: 401,
        message: 'Token is invalid or expired' 
      });
    }

    if (code === 400) {
      const response = {
        code,
        message,
        errors
      }

      if (!errors) {
        delete response.errors;
        return res.status(code).json(response);
      }

      return res.status(code).json(response);
    }

    if (code === 404) {
      return res.status(code).json({
        code,
        message,
        data
      })
    }

    if (err instanceof ResponseError && code !== 500) {
      return res.status(code).json({ 
        code,
        message 
      });
    }

    logger.error(err);
    return res.status(500).json({ 
      code: 500,
      message: 'Internal server error' 
    });
  };

  export default handleError;
