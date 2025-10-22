/**
 * Structured Logging Service
 * Production-ready logging with HCS audit trail
 */

import { supabase } from '@/integrations/supabase/client';
import { hederaService } from '../hedera';

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    CRITICAL = 'critical',
}

export interface LogEntry {
    level: LogLevel;
    message: string;
    context?: Record<string, any>;
    timestamp: string;
    userId?: string;
    sessionId?: string;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
}

export class LoggerService {
    private static instance: LoggerService;
    private sessionId: string;
    private logQueue: LogEntry[] = [];
    private flushInterval: number = 5000; // 5 seconds
    private maxQueueSize: number = 50;

    private constructor() {
        this.sessionId = this.generateSessionId();
        this.startFlushInterval();
    }

    static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private startFlushInterval() {
        if (typeof window === 'undefined') return;

        setInterval(() => {
            this.flush();
        }, this.flushInterval);

        // Flush on page unload
        window.addEventListener('beforeunload', () => {
            this.flush();
        });
    }

    /**
     * Log debug message
     */
    debug(message: string, context?: Record<string, any>) {
        this.log(LogLevel.DEBUG, message, context);
    }

    /**
     * Log info message
     */
    info(message: string, context?: Record<string, any>) {
        this.log(LogLevel.INFO, message, context);
    }

    /**
     * Log warning
     */
    warn(message: string, context?: Record<string, any>) {
        this.log(LogLevel.WARN, message, context);
    }

    /**
     * Log error
     */
    error(message: string, error?: Error, context?: Record<string, any>) {
        const errorContext = error ? {
            ...context,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
        } : context;

        this.log(LogLevel.ERROR, message, errorContext);
    }

    /**
     * Log critical error (always sends to HCS immediately)
     */
    critical(message: string, error?: Error, context?: Record<string, any>) {
        const errorContext = error ? {
            ...context,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
        } : context;

        this.log(LogLevel.CRITICAL, message, errorContext);
        this.flush(); // Immediate flush for critical errors
    }

    /**
     * Log entry to queue
     */
    private async log(level: LogLevel, message: string, context?: Record<string, any>) {
        const entry: LogEntry = {
            level,
            message,
            context,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
        };

        // Add user ID if available
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                entry.userId = user.id;
            }
        } catch (err) {
            // Ignore auth errors in logging
        }

        // Console output in development
        if (import.meta.env.DEV) {
            const consoleMethod = level === LogLevel.ERROR || level === LogLevel.CRITICAL ? 'error'
                : level === LogLevel.WARN ? 'warn'
                    : 'log';
            console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context || '');
        }

        // Add to queue
        this.logQueue.push(entry);

        // Auto-flush if queue is full
        if (this.logQueue.length >= this.maxQueueSize) {
            this.flush();
        }
    }

    /**
     * Flush log queue to backend/HCS
     */
    private async flush() {
        if (this.logQueue.length === 0) return;

        const logsToSend = [...this.logQueue];
        this.logQueue = [];

        try {
            // TODO: Re-enable when application_logs table is created
            // const { error: dbError } = await supabase
            //     .from('application_logs')
            //     .insert(logsToSend.map(log => ({
            //         level: log.level,
            //         message: log.message,
            //         context: log.context,
            //         timestamp: log.timestamp,
            //         user_id: log.userId,
            //         session_id: log.sessionId,
            //     })));

            // if (dbError) {
            //     console.error('Failed to store logs in database:', dbError);
            // }
            console.log('Logs queued:', logsToSend.length);

            // Log critical errors to HCS for immutable audit trail
            const criticalLogs = logsToSend.filter(log => log.level === LogLevel.CRITICAL);
            for (const log of criticalLogs) {
                try {
                    await hederaService.logToHCS({
                        topicId: import.meta.env.VITE_HCS_LOG_TOPIC_ID || '',
                        messageType: 'critical_error',
                        message: {
                            level: log.level,
                            message: log.message,
                            context: log.context,
                            timestamp: log.timestamp,
                            userId: log.userId,
                        },
                    });
                } catch (hcsError) {
                    console.error('Failed to log to HCS:', hcsError);
                }
            }
        } catch (error) {
            console.error('Failed to flush logs:', error);
            // Re-queue logs on failure
            this.logQueue = [...logsToSend, ...this.logQueue];
        }
    }

    /**
     * Log Hedera transaction
     */
    async logTransaction(
        transactionType: string,
        transactionId: string,
        status: 'success' | 'failed',
        details?: Record<string, any>
    ) {
        this.info(`Hedera transaction ${status}`, {
            transactionType,
            transactionId,
            status,
            ...details,
        });

        // Also log to HCS
        try {
            await hederaService.logToHCS({
                topicId: import.meta.env.VITE_HCS_LOG_TOPIC_ID || '',
                messageType: 'transaction_log',
                message: {
                    transactionType,
                    transactionId,
                    status,
                    timestamp: new Date().toISOString(),
                    details,
                },
            });
        } catch (error) {
            console.error('Failed to log transaction to HCS:', error);
        }
    }

    /**
     * Log user action
     */
    logAction(action: string, details?: Record<string, any>) {
        this.info(`User action: ${action}`, details);
    }
}

// Export singleton instance
export const logger = LoggerService.getInstance();
