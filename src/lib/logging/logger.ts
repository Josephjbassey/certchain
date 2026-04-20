// Replaced Supabase logger with local console logger stub
export const Logger = {
  log: (msg: string, ...args: unknown[]) => console.log(msg, ...args),
  error: (msg: string, ...args: unknown[]) => console.error(msg, ...args),
  warn: (msg: string, ...args: unknown[]) => console.warn(msg, ...args)
};

export const logger = Logger;
export const LoggerService = Logger;
export type LogLevel = 'info' | 'warn' | 'error';
export interface LogEntry {
    level: LogLevel;
    message: string;
}
