import type { DatabaseConfig } from "./db"

/**
 * Load database configuration from environment variables
 */
export function loadDatabaseConfig(): DatabaseConfig {
  const dbType = (process.env.DB_TYPE as "mysql" | "sqlite") || "sqlite"

  if (dbType === "mysql") {
    // MySQL configuration
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      throw new Error("MySQL configuration incomplete. Required: DB_HOST, DB_USER, DB_NAME")
    }

    return {
      type: "mysql",
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME,
      port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
    }
  } else {
    // SQLite configuration (default)
    return {
      type: "sqlite",
      filename: process.env.DB_FILENAME || "./zombiecoder.db",
    }
  }
}

/**
 * Validate database configuration
 */
export function validateDatabaseConfig(config: DatabaseConfig): boolean {
  if (config.type === "mysql") {
    return !!(config.host && config.user && config.database)
  } else if (config.type === "sqlite") {
    return !!config.filename
  }
  return false
}

/**
 * Get database connection string for logging (without password)
 */
export function getDatabaseConnectionString(config: DatabaseConfig): string {
  if (config.type === "mysql") {
    return `mysql://${config.user}@${config.host}:${config.port || 3306}/${config.database}`
  } else {
    return `sqlite://${config.filename}`
  }
}
