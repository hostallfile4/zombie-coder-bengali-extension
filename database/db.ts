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
}

export class DatabaseManager {
  private db: Database | null = null
  private config: DatabaseConfig

  constructor(config: DatabaseConfig) {
    this.config = config
  }

  async connect(): Promise<Database> {
    if (this.db) {
      return this.db
    }

    if (this.config.type === "mysql") {
      this.db = await mysql.createConnection({
        host: this.config.host || "localhost",
        user: this.config.user || "root",
        password: this.config.password || "",
        database: this.config.database || "zombiecoder_db",
        multipleStatements: true,
      })
      console.log("Connected to MySQL database")
    } else {
      this.db = await open({
        filename: this.config.filename || path.join(process.cwd(), "zombiecoder.db"),
        driver: sqlite3.Database,
      })
      console.log("Connected to SQLite database")
    }

    return this.db
  }

  async disconnect(): Promise<void> {
    if (!this.db) return

    if (this.config.type === "mysql") {
      await (this.db as mysql.Connection).end()
    } else {
      await (this.db as SQLiteDatabase).close()
    }

    this.db = null
    console.log("Database connection closed")
  }

  async query(sql: string, params?: any[]): Promise<any> {
    if (!this.db) {
      throw new Error("Database not connected")
    }

    if (this.config.type === "mysql") {
      const [rows] = await (this.db as mysql.Connection).execute(sql, params)
      return rows
    } else {
      if (sql.toLowerCase().startsWith("select")) {
        return await (this.db as SQLiteDatabase).all(sql, params)
      } else {
        return await (this.db as SQLiteDatabase).run(sql, params)
      }
    }
  }

  async exec(sql: string): Promise<void> {
    if (!this.db) {
      throw new Error("Database not connected")
    }

    if (this.config.type === "mysql") {
      await (this.db as mysql.Connection).query(sql)
    } else {
      await (this.db as SQLiteDatabase).exec(sql)
    }
  }

  getDatabase(): Database {
    if (!this.db) {
      throw new Error("Database not connected")
    }
    return this.db
  }
}

// Singleton instance
let dbManager: DatabaseManager | null = null

export function initDatabase(config: DatabaseConfig): DatabaseManager {
  if (!dbManager) {
    dbManager = new DatabaseManager(config)
  }
  return dbManager
}

export function getDatabase(): DatabaseManager {
  if (!dbManager) {
    throw new Error("Database not initialized. Call initDatabase first.")
  }
  return dbManager
}
