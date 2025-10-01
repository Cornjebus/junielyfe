/**
 * Secrets Management Utility
 *
 * Secure handling of API keys, tokens, and sensitive configuration.
 * Validates environment variables and provides type-safe access.
 */

/**
 * Environment variable schema
 */
export const ENV_SCHEMA = {
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: { required: true, public: true },
  CLERK_SECRET_KEY: { required: true, public: false },
  CLERK_WEBHOOK_SECRET: { required: false, public: false },

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: { required: true, public: true },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: { required: true, public: true },
  SUPABASE_SERVICE_ROLE_KEY: { required: true, public: false },
  SUPABASE_DB_PASSWORD: { required: false, public: false },
  DATABASE_URL: { required: false, public: false },

  // OpenAI
  OPENAI_API_KEY: { required: true, public: false },

  // QStash
  QSTASH_URL: { required: false, public: false },
  QSTASH_TOKEN: { required: false, public: false },
  QSTASH_CURRENT_SIGNING_KEY: { required: false, public: false },
  QSTASH_NEXT_SIGNING_KEY: { required: false, public: false },

  // PostHog
  NEXT_PUBLIC_POSTHOG_KEY: { required: false, public: true },
  NEXT_PUBLIC_POSTHOG_HOST: { required: false, public: true },

  // App Configuration
  NEXT_PUBLIC_APP_URL: { required: true, public: true },
  WORKER_URL: { required: false, public: false },
  NODE_ENV: { required: true, public: true },
  PORT: { required: false, public: false },
} as const;

export type EnvKey = keyof typeof ENV_SCHEMA;

/**
 * Validate environment variables
 *
 * @throws Error if required variables are missing
 */
export function validateEnv(): void {
  const missing: string[] = [];
  const isServer = typeof window === 'undefined';

  for (const [key, config] of Object.entries(ENV_SCHEMA)) {
    // Skip server-only vars in browser
    if (!isServer && !config.public) {
      continue;
    }

    if (config.required && !process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\n` +
        `Please check your .env.local file or environment configuration.`
    );
  }
}

/**
 * Get environment variable with type safety
 *
 * @param key - The environment variable key
 * @param fallback - Optional fallback value
 * @returns The environment variable value
 *
 * @example
 * ```typescript
 * const apiKey = getEnv('OPENAI_API_KEY');
 * const port = getEnv('PORT', '3000');
 * ```
 */
export function getEnv(key: EnvKey, fallback?: string): string {
  const value = process.env[key];

  if (!value && fallback === undefined) {
    const config = ENV_SCHEMA[key];
    if (config.required) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return value || fallback || '';
}

/**
 * Check if environment variable is set
 *
 * @param key - The environment variable key
 * @returns True if the variable is set and non-empty
 */
export function hasEnv(key: EnvKey): boolean {
  return Boolean(process.env[key]);
}

/**
 * Mask sensitive value for logging
 *
 * @param value - The value to mask
 * @param visibleChars - Number of characters to show at start/end
 * @returns Masked value
 *
 * @example
 * ```typescript
 * maskSecret('sk_test_1234567890abcdef') // => 'sk_t***cdef'
 * maskSecret('my-secret-key', 2) // => 'my***ey'
 * ```
 */
export function maskSecret(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars * 2) {
    return '*'.repeat(value.length);
  }

  const start = value.slice(0, visibleChars);
  const end = value.slice(-visibleChars);
  return `${start}***${end}`;
}

/**
 * Safe environment object for logging/debugging
 *
 * @returns Object with public env vars and masked secrets
 *
 * @example
 * ```typescript
 * const safeEnv = getSafeEnv();
 * console.log(safeEnv);
 * // {
 * //   NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
 * //   CLERK_SECRET_KEY: 'sk_t***ed2',
 * //   ...
 * // }
 * ```
 */
export function getSafeEnv(): Record<string, string> {
  const safe: Record<string, string> = {};

  for (const [key, config] of Object.entries(ENV_SCHEMA)) {
    const value = process.env[key];
    if (!value) continue;

    if (config.public) {
      safe[key] = value;
    } else {
      safe[key] = maskSecret(value);
    }
  }

  return safe;
}

/**
 * Detect if secrets are hardcoded (security check)
 *
 * @param code - Source code to check
 * @returns Array of potential hardcoded secrets
 *
 * @example
 * ```typescript
 * const issues = detectHardcodedSecrets(`
 *   const apiKey = "sk_test_1234567890";
 * `);
 * // => [{ line: 2, type: 'API Key', value: 'sk_test_1234567890' }]
 * ```
 */
export function detectHardcodedSecrets(code: string): Array<{
  line: number;
  type: string;
  value: string;
}> {
  const issues: Array<{ line: number; type: string; value: string }> = [];
  const lines = code.split('\n');

  const patterns = [
    { type: 'API Key', pattern: /(?:sk|pk|api|token|key)[-_][a-zA-Z0-9]{20,}/gi },
    { type: 'JWT', pattern: /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g },
    { type: 'Password', pattern: /password\s*[:=]\s*["']([^"']{8,})["']/gi },
  ];

  lines.forEach((line, index) => {
    for (const { type, pattern } of patterns) {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        issues.push({
          line: index + 1,
          type,
          value: match[0],
        });
      }
    }
  });

  return issues;
}

/**
 * Runtime environment type
 */
export type RuntimeEnv = 'development' | 'production' | 'test';

/**
 * Get current runtime environment
 */
export function getRuntimeEnv(): RuntimeEnv {
  const env = process.env.NODE_ENV;
  if (env === 'production' || env === 'test') {
    return env;
  }
  return 'development';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getRuntimeEnv() === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getRuntimeEnv() === 'development';
}

/**
 * Check if running in test environment
 */
export function isTest(): boolean {
  return getRuntimeEnv() === 'test';
}
