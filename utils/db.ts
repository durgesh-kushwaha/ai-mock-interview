import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Enhanced database configuration with better error handling
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL, {
  // Connection configuration for better performance
  fetchOptions: {
    // Timeout after 10 seconds
    timeout: 10000,
  },
});

export const db = drizzle(sql, { 
  schema,
  // Additional Drizzle configuration
  logger: process.env.NODE_ENV === 'development' ? {
    logQuery: (query: string, params: unknown[]) => {
      console.log('📊 Database Query:', { query, params });
    }
  } : false,
});

// Database error types for better error handling
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class UniqueConstraintError extends DatabaseError {
  constructor(message: string = 'Unique constraint violation', originalError?: unknown) {
    super(message, '23505', originalError);
    this.name = 'UniqueConstraintError';
  }
}

export class ForeignKeyConstraintError extends DatabaseError {
  constructor(message: string = 'Foreign key constraint violation', originalError?: unknown) {
    super(message, '23503', originalError);
    this.name = 'ForeignKeyConstraintError';
  }
}

// Utility function to handle database errors
export function handleDatabaseError(error: unknown): DatabaseError {
  if (error instanceof DatabaseError) {
    return error;
  }

  const err = error as { code?: string; message?: string };
  
  switch (err.code) {
    case '23505':
      return new UniqueConstraintError(err.message, error);
    case '23503':
      return new ForeignKeyConstraintError(err.message, error);
    default:
      return new DatabaseError(
        err.message || 'Unknown database error occurred',
        err.code,
        error
      );
  }
}
