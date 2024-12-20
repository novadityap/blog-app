import winston from "winston";
import "winston-daily-rotate-file";
import 'dotenv/config';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`)
);

const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: 'src/logs/error.log', 
      level: 'error'
    }),
    new winston.transports.DailyRotateFile({
      filename: 'src/logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '2',
      format: logFormat,
      utc: true
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({filename: 'src/logs/exception.log'})
  ],
  rejectionHandlers: [
    new winston.transports.File({filename: 'src/logs/rejection.log'})
  ]
});

if(process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({format: consoleFormat}));
}

export default logger;