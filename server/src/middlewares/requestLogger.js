import logger from '../utils/logger.js';

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logMessage = `${req.method} ${req.originalUrl} - ${res.statusCode} ${duration}ms`;
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    const logMeta = {
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      userAgent: req.headers['user-agent'],
    }

    logger.log(logLevel, logMessage, logMeta);
  });

  next();
};

export default requestLogger;
