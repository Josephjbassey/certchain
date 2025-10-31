/**
 * Structured Logger for Edge Functions
 * 
 * Provides consistent logging across all edge functions with structured output.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  functionName?: string;
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

class Logger {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, meta?: Record<string, any>) {
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...this.context,
      ...meta,
    };

    const logMethod = level === 'error' ? console.error : 
                     level === 'warn' ? console.warn :
                     console.log;

    logMethod(JSON.stringify(logEntry));
  }

  debug(message: string, meta?: Record<string, any>) {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: Record<string, any>) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, any>) {
    this.log('warn', message, meta);
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, any>) {
    const errorMeta = {
      ...meta,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };
    this.log('error', message, errorMeta);
  }

  child(additionalContext: LogContext): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }
}

/**
 * Create a logger instance for an edge function
 */
export function createLogger(functionName: string, req?: Request): Logger {
  const context: LogContext = {
    functionName,
  };

  if (req) {
    context.requestId = crypto.randomUUID();
    context.method = req.method;
    context.url = req.url;
  }

  return new Logger(context);
}

/**
 * Log transaction details
 */
export function logTransaction(
  logger: Logger,
  transactionType: string,
  transactionId: string,
  details?: Record<string, any>
) {
  logger.info('Transaction executed', {
    transactionType,
    transactionId,
    ...details,
  });
}

/**
 * Log API call to external service
 */
export function logExternalApiCall(
  logger: Logger,
  service: string,
  endpoint: string,
  success: boolean,
  duration?: number,
  details?: Record<string, any>
) {
  const message = `External API call to ${service}: ${success ? 'success' : 'failed'}`;
  const meta = {
    service,
    endpoint,
    success,
    duration,
    ...details,
  };

  if (success) {
    logger.info(message, meta);
  } else {
    logger.warn(message, meta);
  }
}

/**
 * Log database operation
 */
export function logDatabaseOperation(
  logger: Logger,
  operation: string,
  table: string,
  success: boolean,
  details?: Record<string, any>
) {
  const message = `Database ${operation} on ${table}: ${success ? 'success' : 'failed'}`;
  const meta = {
    operation,
    table,
    success,
    ...details,
  };

  if (success) {
    logger.info(message, meta);
  } else {
    logger.error(message, undefined, meta);
  }
}

export { Logger, type LogLevel, type LogContext };
