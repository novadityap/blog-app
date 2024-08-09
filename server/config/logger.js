import winston from "winston";
import "winston-daily-rotate-file";

const customFormat = winston.format.combine(
  winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
  winston.format.errors({stack: true}),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${message + (stack ? '\n' + stack : '')}`;
  })
);

const logger = winston.createLogger({
  level: 'info',
  format: customFormat,
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log', 
      level: 'error'
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: customFormat
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({filename: 'logs/exception.log'})
  ],
  rejectionHandlers: [
    new winston.transports.File({filename: 'logs/rejection.log'})
  ]
});

if(process.env.NODE_ENV !== 'prod') {
  logger.add(new winston.transports.Console({format: winston.format.prettyPrint()}));
}

export default logger;