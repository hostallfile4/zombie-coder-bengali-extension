import mysql from "mysql2/promise"
import sqlite3 from "sqlite3"
import { open, type Database as SQLiteDatabase } from "sqlite"
import path from "path"

export type Database = mysql.Connection | SQLiteDatabase

export interface DatabaseConfig {
  type: "mysql" | "sqlite"
  host?: string
  user?: string
  password?: string
  database?: string
  filename?: string
  port?: number
}

export class DatabaseManager {
  private db: Database | null = null
  private config: DatabaseConfig
  private connected = false

  constructor(config: DatabaseConfig) {
    this.config = config
  }

  async connect(): Promise<Database> {
    if (this.db && this.connected) {
      return this.db
    }

    try {
      if (this.config.type === "mysql") {
        this.db = await mysql.createConnection({
          host: this.config.host || "127.0.0.1",
          port: this.config.port || 3306,
          user: this.config.user || "root",
          password: this.config.password || "",
          database: this.config.database || "zombiecoder",
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        })
        this.connected = true
        console.log("[DB] Connected to MySQL:", this.config.database)
      } else {
        this.db = await open({
          filename: this.config.filename || path.join(process.cwd(), "zombiecoder.db"),
          driver: sqlite3.Database,
        })
        this.connected = true
        console.log("[DB] Connected to SQLite:", this.config.filename)
      }
    } catch (error) {
      console.error("[DB] Connection error:", error)
      throw error
    }

    return this.db
  }

  async disconnect(): Promise<void> {
    if (!this.db || !this.connected) return

    try {
      if (this.config.type === "mysql") {
        await (this.db as mysql.Connection).end()
      } else {
        await (this.db as SQLiteDatabase).close()
      }
      this.connected = false
      this.db = null
      console.log("[DB] Connection closed")
    } catch (error) {
      console.error("[DB] Disconnect error:", error)
    }
  }

  async query(sql: string, params?: any[]): Promise<any> {
    if (!this.db || !this.connected) {
      await this.connect()
    }

    try {
      if (this.config.type === "mysql") {
        const [rows] = await (this.db as mysql.Connection).execute(sql, params || [])
        return rows
      } else {
        if (sql.toLowerCase().trim().startsWith("select")) {
          return await (this.db as SQLiteDatabase).all(sql, params)
        } else {
          return await (this.db as SQLiteDatabase).run(sql, params)
        }
      }
    } catch (error) {
      console.error("[DB] Query error:", error, sql)
      throw error
    }
  }

  async exec(sql: string): Promise<void> {
    if (!this.db || !this.connected) {
      await this.connect()
    }

    try {
      if (this.config.type === "mysql") {
        await (this.db as mysql.Connection).query(sql)
      } else {
        await (this.db as SQLiteDatabase).exec(sql)
      }
    } catch (error) {
      console.error("[DB] Exec error:", error)
      throw error
    }
  }

  isConnected(): boolean {
    return this.connected
  }

  getDatabase(): Database {
    if (!this.db || !this.connected) {
      throw new Error("Database not connected. Call connect() first.")
    }
    return this.db
  }
}

let dbManager: DatabaseManager | null = null

export function initDatabase(config?: DatabaseConfig): DatabaseManager {
  if (!dbManager) {
    const finalConfig: DatabaseConfig = config || {
      type: (process.env.DB_CONNECTION === "mysql" ? "mysql" : "sqlite") as "mysql" | "sqlite",
      host: process.env.DB_HOST || "127.0.0.1",
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      user: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_DATABASE || "zombiecoder",
      filename: process.env.DB_FILENAME || path.join(process.cwd(), "zombiecoder.db"),
    }
    dbManager = new DatabaseManager(finalConfig)
  }
  return dbManager
}

export function getDatabase(): DatabaseManager {
  if (!dbManager) {
    return initDatabase()
  }
  return dbManager
}
