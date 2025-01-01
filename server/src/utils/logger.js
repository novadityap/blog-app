import winston from "winston";
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
    new winston.transports.File({filename: `src/logs/app-${new Date().toISOString().split('T')[0]}.log`}),
    new winston.transports.File({
      filename: 'src/logs/error.log', 
      level: 'error'
    }),
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