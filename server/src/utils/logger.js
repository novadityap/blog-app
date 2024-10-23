import winston from "winston";
import "winston-daily-rotate-file";

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, stack, meta }) => `${timestamp} [${level}]: ${stack || message}` + (meta ? ` ${JSON.stringify(meta)}` : ''))
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
      maxFiles: '3',
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

if(process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({format: consoleFormat}));
}

export default logger;