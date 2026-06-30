import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters'),
  UPLOAD_DIR: z.string().default('./uploads'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
});

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

const parseResult = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  UPLOAD_DIR: process.env.UPLOAD_DIR,
  LOG_LEVEL: process.env.LOG_LEVEL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!parseResult.success && !isBuildTime) {
  /* eslint-disable no-console */
  console.error('❌ Environment validation failed:');
  console.error(JSON.stringify(parseResult.error.format(), null, 2));
  /* eslint-enable no-console */
  throw new Error('Invalid environment variables.');
}

// Fallback empty object if in build-time and parsing failed
export const env = parseResult.success
  ? parseResult.data
  : ({} as z.infer<typeof envSchema>);

export type Env = z.infer<typeof envSchema>;
export default env;
