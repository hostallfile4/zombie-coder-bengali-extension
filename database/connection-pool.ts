import { DatabaseManager, type DatabaseConfig } from "./db"
import { loadDatabaseConfig } from "./config"

/**
 * Database connection pool manager
 * Provides singleton access to database connections
 */
class ConnectionPool {
  private static instance: ConnectionPool
  private connections: Map<string, DatabaseManager> = new Map()
  private defaultConfig: DatabaseConfig

  private constructor() {
    this.defaultConfig = loadDatabaseConfig()
  }

  static getInstance(): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool()
    }
    return ConnectionPool.instance
  }

  /**
   * Get or create a database connection
   */
  async getConnection(name = "default"): Promise<DatabaseManager> {
    if (!this.connections.has(name)) {
      const dbManager = new DatabaseManager(this.defaultConfig)
      await dbManager.connect()
      this.connections.set(name, dbManager)
    }
    return this.connections.get(name)!
  }

  /**
   * Close a specific connection
   */
  async closeConnection(name: string): Promise<void> {
    const connection = this.connections.get(name)
    if (connection) {
      await connection.disconnect()
      this.connections.delete(name)
    }
  }

  /**
   * Close all connections
   */
  async closeAll(): Promise<void> {
    const closePromises = Array.from(this.connections.values()).map((conn) => conn.disconnect())
    await Promise.all(closePromises)
    this.connections.clear()
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.connections.size
  }
}

// Export singleton instance
export const connectionPool = ConnectionPool.getInstance()

// Helper function for easy access
export async function getDatabase(name?: string): Promise<DatabaseManager> {
  return connectionPool.getConnection(name)
}
