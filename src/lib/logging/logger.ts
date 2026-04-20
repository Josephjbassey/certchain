// Replaced Supabase logger with local console logger stub
export const Logger = {
  log: (msg: string, ...args: unknown[]) => console.log(msg, ...args),
  error: (msg: string, ...args: unknown[]) => console.error(msg, ...args),
  warn: (msg: string, ...args: unknown[]) => console.warn(msg, ...args)
};
