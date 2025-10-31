/**
 * Input Validation Utilities for Edge Functions
 * 
 * Provides schema validation and type checking for edge function inputs.
 */

import { badRequestError, validationError } from './error-handler.ts';

/**
 * Schema definition type
 */
export interface ValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
    validate?: (value: any) => boolean;
    errorMessage?: string;
  };
}

/**
 * Validate request body against schema
 */
export async function validateRequest<T = any>(
  req: Request,
  schema: ValidationSchema
): Promise<T> {
  let body: any;

  try {
    body = await req.json();
  } catch (error) {
    throw badRequestError('Invalid JSON in request body');
  }

  const errors: string[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];

    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip validation if not required and not provided
    if (!rules.required && (value === undefined || value === null)) {
      continue;
    }

    // Type checking
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== rules.type) {
      errors.push(`${field} must be of type ${rules.type}, got ${actualType}`);
      continue;
    }

    // String validation
    if (rules.type === 'string' && typeof value === 'string') {
      if (rules.min !== undefined && value.length < rules.min) {
        errors.push(`${field} must be at least ${rules.min} characters`);
      }
      if (rules.max !== undefined && value.length > rules.max) {
        errors.push(`${field} must be at most ${rules.max} characters`);
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(rules.errorMessage || `${field} format is invalid`);
      }
    }

    // Number validation
    if (rules.type === 'number' && typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`);
      }
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }

    // Custom validation
    if (rules.validate && !rules.validate(value)) {
      errors.push(rules.errorMessage || `${field} validation failed`);
    }
  }

  if (errors.length > 0) {
    throw badRequestError('Validation failed', errors.join('; '));
  }

  return body as T;
}

/**
 * Validate Hedera Account ID
 */
export function isValidHederaAccountId(accountId: string): boolean {
  const accountIdRegex = /^(\d+)\.(\d+)\.(\d+)(-[a-z]{5})?$/;
  return accountIdRegex.test(accountId);
}

/**
 * Validate Hedera Token ID
 */
export function isValidHederaTokenId(tokenId: string): boolean {
  const tokenIdRegex = /^(\d+)\.(\d+)\.(\d+)$/;
  return tokenIdRegex.test(tokenId);
}

/**
 * Validate Hedera Topic ID
 */
export function isValidHederaTopicId(topicId: string): boolean {
  const topicIdRegex = /^(\d+)\.(\d+)\.(\d+)$/;
  return topicIdRegex.test(topicId);
}

/**
 * Validate Network
 */
export function isValidNetwork(network: string): boolean {
  return ['testnet', 'mainnet', 'previewnet'].includes(network);
}

/**
 * Validate UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate Email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize string input (prevent XSS)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>'"]/g, '')
    .trim();
}

/**
 * Common validation schemas
 */
export const COMMON_SCHEMAS = {
  hederaMint: {
    recipientAccountId: {
      type: 'string' as const,
      required: true,
      validate: isValidHederaAccountId,
      errorMessage: 'Invalid Hedera account ID format (must be X.X.X)',
    },
    metadataCid: {
      type: 'string' as const,
      required: true,
      pattern: /^Qm[1-9A-HJ-NP-Za-km-z]{44,}$/,
      errorMessage: 'Invalid IPFS CID format',
    },
    network: {
      type: 'string' as const,
      required: false,
      enum: ['testnet', 'mainnet', 'previewnet'],
    },
  },
  hederaDid: {
    userAccountId: {
      type: 'string' as const,
      required: true,
      validate: isValidHederaAccountId,
      errorMessage: 'Invalid Hedera account ID format',
    },
    network: {
      type: 'string' as const,
      required: false,
      enum: ['testnet', 'mainnet', 'previewnet'],
    },
  },
  hcsLog: {
    topicId: {
      type: 'string' as const,
      required: true,
      validate: isValidHederaTopicId,
      errorMessage: 'Invalid Hedera topic ID format',
    },
    messageType: {
      type: 'string' as const,
      required: true,
      min: 1,
      max: 100,
    },
    message: {
      type: 'object' as const,
      required: true,
    },
  },
  pinataUpload: {
    type: {
      type: 'string' as const,
      required: true,
      enum: ['metadata', 'file'],
    },
  },
};
