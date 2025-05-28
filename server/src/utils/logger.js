import winston from 'winston';
import 'dotenv/config';
import DailyRotateFile from 'winston-daily-rotate-file';

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(
    ({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`
  )
);

const transports = [
  new DailyRotateFile({
    dirname: 'logs',
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    zippedArchive: true,
    level: 'info',
    format: fileFormat,
  }),
  new DailyRotateFile({
    dirname: 'logs',
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    zippedArchive: true,
    level: 'error',
    format: fileFormat,
  }),
];

const logger = winston.createLogger({
  level: 'info',
  format: fileFormat,
  transports,
  exceptionHandlers: [
    new DailyRotateFile({
      dirname: 'logs',
      filename: 'exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      zippedArchive: true,
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      dirname: 'logs',
      filename: 'rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      zippedArchive: true,
      format: fileFormat,
    }),
  ],
});

if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({ format: consoleFormat }));
}

export default logger;
