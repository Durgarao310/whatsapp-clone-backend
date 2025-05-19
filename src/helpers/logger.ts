import winston from 'winston';
import path from 'path';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // Log stack traces
  winston.format.splat(),
  winston.format.json() // Log in JSON format
);

// Define transports based on environment
const transports = [];

if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: 'debug', // Log debug messages and above in development
    })
  );
} else {
  // Production logging
  transports.push(
    new winston.transports.Console({
      format: logFormat,
      level: 'info', // Log info messages and above in production console
    })
  );
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error', // Log only errors to a file
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      level: 'info', // Log info and above to a combined file
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
  format: logFormat,
  transports,
  exitOnError: false, // Do not exit on handled exceptions
});

// Stream for morgan request logging
export const stream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};

export default logger;
