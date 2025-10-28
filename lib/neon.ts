import { neon } from '@neondatabase/serverless';
import ws from 'ws';

// WebSocket support for Vercel edge runtime
declare global {
  var WebSocket: any;
}

if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws as any;
}

let sqlClient: ReturnType<typeof neon> | undefined;

/**
 * Get or create the Neon SQL client instance
 * Uses singleton pattern for connection reuse
 */
export function getSql() {
  if (!sqlClient) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is not set. Please add your Neon connection string to environment variables.'
      );
    }
    sqlClient = neon(process.env.DATABASE_URL);
  }
  return sqlClient;
}

/**
 * Execute a query using the Neon client with parameters
 * This is a helper for the migration script
 */
export async function execute(sqlText: string, params?: any[]): Promise<any[]> {
  const sql = getSql();
  // Use template literal syntax for Neon
  // Convert params to a format the API understands
  if (params && params.length > 0) {
    return sql`${sqlText}` as any;
  } else {
    return sql(sqlText);
  }
}

/**
 * Execute a query and return results
 * Handles queries with parameters
 */
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const sql = getSql();
  const result = await sql(text, params);
  
  // Neon returns results as an array
  return result as T[];
}

/**
 * Execute a query and return single row
 */
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const results = await query<T>(text, params);
  return results[0] || null;
}

/**
 * Clean empty strings to null for optional database fields
 */
export function cleanEmptyStrings<T>(value: T): T | null {
  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }
  return value;
}

/**
 * Clean all empty strings in an object
 */
export function cleanObject<T extends Record<string, any>>(obj: T): T {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    cleaned[key] = cleanEmptyStrings(value);
  }
  return cleaned as T;
}

/**
 * Validate required fields in an object
 */
export function validateRequiredFields(data: Record<string, any>, requiredFields: string[]): void {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Check database connection
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const result = await query<{ count: number }>('SELECT 1 as count');
    return result.length > 0;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}
