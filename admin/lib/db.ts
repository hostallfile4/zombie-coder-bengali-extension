import { type DatabaseManager, initDatabase } from "../../../database/db"
import { getDatabase as getConnection } from "../../../database/connection-pool"

let dbManager: DatabaseManager | null = null

export async function getDatabaseConnection() {
  return getConnection("admin")
}

export function getDbManager(): DatabaseManager {
  if (!dbManager) {
    dbManager = initDatabase({
      type: (process.env.DB_TYPE as "mysql" | "sqlite") || "sqlite",
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      filename: process.env.DB_FILENAME || "./zombiecoder.db",
    })
  }
  return dbManager
}
