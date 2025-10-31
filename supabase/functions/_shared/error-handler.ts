/**
 * Supabase Edge Function Error Handler
 * 
 * Standardized error response formatting for all edge functions.
 */

import { corsHeaders } from './cors.ts';

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: string;
  timestamp: string;
}

export class EdgeFunctionError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string,
    public details?: string
  ) {
    super(message);
    this.name = 'EdgeFunctionError';
  }
}

/**
 * Standard error response
 */
export function handleError(error: unknown, defaultMessage: string = 'Internal server error'): Response {
  console.error('Edge function error:', error);

  let statusCode = 500;
  let message = defaultMessage;
  let code: string | undefined;
  let details: string | undefined;

  if (error instanceof EdgeFunctionError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
    details = error.details;
  } else if (error instanceof Error) {
    message = error.message;
    
    // Map common error patterns
    if (message.includes('not found')) {
      statusCode = 404;
      code = 'NOT_FOUND';
    } else if (message.includes('unauthorized') || message.includes('permission')) {
      statusCode = 403;
      code = 'FORBIDDEN';
    } else if (message.includes('invalid') || message.includes('required')) {
      statusCode = 400;
      code = 'BAD_REQUEST';
    }
  } else if (typeof error === 'string') {
    message = error;
  }

  const errorResponse: ErrorResponse = {
    error: message,
    code,
    details,
    timestamp: new Date().toISOString(),
  };

  return new Response(
    JSON.stringify(errorResponse),
    {
      status: statusCode,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Success response helper
 */
export function successResponse<T = any>(data: T, statusCode: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status: statusCode,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Not found error
 */
export function notFoundError(resource: string = 'Resource'): EdgeFunctionError {
  return new EdgeFunctionError(
    `${resource} not found`,
    404,
    'NOT_FOUND'
  );
}

/**
 * Unauthorized error
 */
export function unauthorizedError(message: string = 'Unauthorized'): EdgeFunctionError {
  return new EdgeFunctionError(
    message,
    401,
    'UNAUTHORIZED'
  );
}

/**
 * Forbidden error
 */
export function forbiddenError(message: string = 'Forbidden'): EdgeFunctionError {
  return new EdgeFunctionError(
    message,
    403,
    'FORBIDDEN'
  );
}

/**
 * Bad request error
 */
export function badRequestError(message: string, details?: string): EdgeFunctionError {
  return new EdgeFunctionError(
    message,
    400,
    'BAD_REQUEST',
    details
  );
}

/**
 * Validation error
 */
export function validationError(field: string, message: string): EdgeFunctionError {
  return new EdgeFunctionError(
    `Validation failed: ${field} - ${message}`,
    400,
    'VALIDATION_ERROR',
    field
  );
}
