type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel): boolean {
  if (level === 'error') return true; // Always log errors

  const isProduction = process.env.NODE_ENV === 'production';
  const debugEnabled = process.env.DEBUG_HORARIOS === 'true';

  if (isProduction && !debugEnabled) return false;
  return true;
}

function formatMessage(level: LogLevel, tag: string, message: string): string {
  return `[${level.toUpperCase()}][${tag}] ${message}`;
}

export const logger = {
  debug(tag: string, message: string, data?: unknown) {
    if (!shouldLog('debug')) return;
    if (data !== undefined) {
      console.log(formatMessage('debug', tag, message), data);
    } else {
      console.log(formatMessage('debug', tag, message));
    }
  },

  info(tag: string, message: string, data?: unknown) {
    if (!shouldLog('info')) return;
    if (data !== undefined) {
      console.info(formatMessage('info', tag, message), data);
    } else {
      console.info(formatMessage('info', tag, message));
    }
  },

  warn(tag: string, message: string, data?: unknown) {
    if (!shouldLog('warn')) return;
    if (data !== undefined) {
      console.warn(formatMessage('warn', tag, message), data);
    } else {
      console.warn(formatMessage('warn', tag, message));
    }
  },

  error(tag: string, message: string, data?: unknown) {
    if (data !== undefined) {
      console.error(formatMessage('error', tag, message), data);
    } else {
      console.error(formatMessage('error', tag, message));
    }
  },
};
