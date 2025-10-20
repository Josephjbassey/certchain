/**
 * Hedera Error Handling
 * Custom error classes and error handling utilities
 */

export class HederaServiceError extends Error {
    constructor(
        message: string,
        public code: string,
        public transactionId?: string,
        public originalError?: any
    ) {
        super(message);
        this.name = 'HederaServiceError';
    }
}

export class HederaTransactionError extends HederaServiceError {
    constructor(
        message: string,
        public status: string,
        transactionId?: string,
        originalError?: any
    ) {
        super(message, 'TRANSACTION_FAILED', transactionId, originalError);
        this.name = 'HederaTransactionError';
    }
}

export class HederaNetworkError extends HederaServiceError {
    constructor(message: string, originalError?: any) {
        super(message, 'NETWORK_ERROR', undefined, originalError);
        this.name = 'HederaNetworkError';
    }
}

export class HederaValidationError extends HederaServiceError {
    constructor(message: string, public field?: string) {
        super(message, 'VALIDATION_ERROR');
        this.name = 'HederaValidationError';
    }
}

export class IPFSError extends Error {
    constructor(message: string, public originalError?: any) {
        super(message);
        this.name = 'IPFSError';
    }
}

/**
 * Parse Hedera error from various sources
 */
export function parseHederaError(error: any): HederaServiceError {
    // Supabase function error
    if (error?.message) {
        if (error.message.includes('TRANSACTION_FAILED')) {
            return new HederaTransactionError(
                error.message,
                error.status || 'UNKNOWN',
                error.transactionId
            );
        }
        if (error.message.includes('INSUFFICIENT_')) {
            return new HederaServiceError(
                'Insufficient balance or account resources',
                'INSUFFICIENT_RESOURCES',
                undefined,
                error
            );
        }
        if (error.message.includes('INVALID_')) {
            return new HederaValidationError(error.message);
        }
    }

    // Network errors
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
        return new HederaNetworkError('Unable to connect to Hedera network', error);
    }

    // Generic error
    return new HederaServiceError(
        error?.message || 'Unknown Hedera error',
        'UNKNOWN_ERROR',
        undefined,
        error
    );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
    if (error instanceof HederaTransactionError) {
        return `Transaction failed: ${error.message}. Please try again.`;
    }
    if (error instanceof HederaNetworkError) {
        return 'Network error. Please check your connection and try again.';
    }
    if (error instanceof HederaValidationError) {
        return `Invalid input: ${error.message}`;
    }
    if (error instanceof IPFSError) {
        return 'Failed to upload to IPFS. Please try again.';
    }
    if (error instanceof HederaServiceError) {
        return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
}

/**
 * Retry utility for Hedera operations
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            // Don't retry validation errors
            if (error instanceof HederaValidationError) {
                throw error;
            }

            if (attempt < maxRetries) {
                console.warn(`Operation failed (attempt ${attempt}/${maxRetries}), retrying...`, error);
                await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
            }
        }
    }

    throw parseHederaError(lastError);
}
