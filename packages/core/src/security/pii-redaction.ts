/**
 * PII Redaction Utilities
 *
 * Server-side functions to redact personally identifiable information (PII)
 * from logs, analytics events, and error messages.
 *
 * GDPR Compliance: Ensures sensitive data is not exposed in logs or third-party services.
 */

/**
 * Patterns for detecting PII
 */
const PII_PATTERNS = {
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // Phone numbers (US and international formats)
  phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,

  // Social Security Numbers (US)
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,

  // Credit card numbers (basic pattern)
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,

  // IP addresses
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,

  // API keys and tokens (common patterns)
  apiKey: /\b(?:sk|pk|api|token|key)[-_]?[a-zA-Z0-9]{20,}\b/gi,

  // JWT tokens
  jwt: /\beyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g,
};

/**
 * Redaction replacement text
 */
const REDACTED_TEXT = {
  email: '[EMAIL_REDACTED]',
  phone: '[PHONE_REDACTED]',
  ssn: '[SSN_REDACTED]',
  creditCard: '[CARD_REDACTED]',
  ipAddress: '[IP_REDACTED]',
  apiKey: '[API_KEY_REDACTED]',
  jwt: '[JWT_REDACTED]',
};

/**
 * Redact PII from a string
 *
 * @param text - The text to redact PII from
 * @param options - Configuration options
 * @returns The redacted text
 *
 * @example
 * ```typescript
 * const log = "User john@example.com called from 555-1234";
 * const redacted = redactPII(log);
 * // => "User [EMAIL_REDACTED] called from [PHONE_REDACTED]"
 * ```
 */
export function redactPII(
  text: string,
  options: {
    patterns?: (keyof typeof PII_PATTERNS)[];
    preserveLength?: boolean;
  } = {}
): string {
  const { patterns = Object.keys(PII_PATTERNS) as (keyof typeof PII_PATTERNS)[], preserveLength = false } = options;

  let redacted = text;

  for (const patternKey of patterns) {
    const pattern = PII_PATTERNS[patternKey];
    const replacement = REDACTED_TEXT[patternKey];

    if (preserveLength) {
      // Replace with asterisks of same length
      redacted = redacted.replace(pattern, (match) => '*'.repeat(match.length));
    } else {
      redacted = redacted.replace(pattern, replacement);
    }
  }

  return redacted;
}

/**
 * Redact PII from an object (deeply)
 *
 * @param obj - The object to redact PII from
 * @param options - Configuration options
 * @returns A new object with PII redacted
 *
 * @example
 * ```typescript
 * const data = {
 *   user: {
 *     email: "john@example.com",
 *     phone: "555-1234"
 *   },
 *   message: "Contact me at john@example.com"
 * };
 *
 * const redacted = redactPIIFromObject(data);
 * // => {
 * //   user: {
 * //     email: "[EMAIL_REDACTED]",
 * //     phone: "[PHONE_REDACTED]"
 * //   },
 * //   message: "Contact me at [EMAIL_REDACTED]"
 * // }
 * ```
 */
export function redactPIIFromObject<T>(
  obj: T,
  options: {
    patterns?: (keyof typeof PII_PATTERNS)[];
    preserveLength?: boolean;
    excludeKeys?: string[];
  } = {}
): T {
  const { excludeKeys = [] } = options;

  if (typeof obj !== 'object' || obj === null) {
    if (typeof obj === 'string') {
      return redactPII(obj, options) as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactPIIFromObject(item, options)) as T;
  }

  const redacted: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (excludeKeys.includes(key)) {
      redacted[key] = value;
      continue;
    }

    if (typeof value === 'string') {
      redacted[key] = redactPII(value, options);
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactPIIFromObject(value, options);
    } else {
      redacted[key] = value;
    }
  }

  return redacted as T;
}

/**
 * Redact specific fields from an object
 *
 * @param obj - The object to redact fields from
 * @param fields - Array of field paths to redact (supports dot notation)
 * @returns A new object with specified fields redacted
 *
 * @example
 * ```typescript
 * const user = {
 *   name: "John Doe",
 *   email: "john@example.com",
 *   profile: {
 *     ssn: "123-45-6789"
 *   }
 * };
 *
 * const redacted = redactFields(user, ['email', 'profile.ssn']);
 * // => {
 * //   name: "John Doe",
 * //   email: "[REDACTED]",
 * //   profile: {
 * //     ssn: "[REDACTED]"
 * //   }
 * // }
 * ```
 */
export function redactFields<T>(obj: T, fields: string[], redactionText = '[REDACTED]'): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const redacted = JSON.parse(JSON.stringify(obj)); // Deep clone

  for (const field of fields) {
    const parts = field.split('.');
    let current: any = redacted;

    for (let i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]] === undefined) {
        break;
      }
      current = current[parts[i]];
    }

    const lastPart = parts[parts.length - 1];
    if (current && current[lastPart] !== undefined) {
      current[lastPart] = redactionText;
    }
  }

  return redacted;
}

/**
 * Safe logger that automatically redacts PII
 *
 * @example
 * ```typescript
 * const logger = createSafeLogger();
 * logger.info("User john@example.com logged in from 192.168.1.1");
 * // Logs: "User [EMAIL_REDACTED] logged in from [IP_REDACTED]"
 * ```
 */
export function createSafeLogger(options?: {
  patterns?: (keyof typeof PII_PATTERNS)[];
  preserveLength?: boolean;
}) {
  const log = (level: 'info' | 'warn' | 'error', ...args: any[]) => {
    const redactedArgs = args.map((arg) => {
      if (typeof arg === 'string') {
        return redactPII(arg, options);
      }
      if (typeof arg === 'object' && arg !== null) {
        return redactPIIFromObject(arg, options);
      }
      return arg;
    });

    console[level](...redactedArgs);
  };

  return {
    info: (...args: any[]) => log('info', ...args),
    warn: (...args: any[]) => log('warn', ...args),
    error: (...args: any[]) => log('error', ...args),
  };
}
