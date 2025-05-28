import logger from '../utils/logger.js';

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  req.metadata = {
    ip: req.ip,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.headers['user-agent'],
  }
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const message = `${req.method} ${req.originalUrl} ${duration}ms`;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger.log(level, message, req.metadata);
  });

  next();
};

export default requestLogger;
