import { DatabaseManager, type DatabaseConfig } from "./db"
import fs from "fs"
import path from "path"

interface Migration {
  id: number
  name: string
  up: (db: any) => Promise<void>
  down: (db: any) => Promise<void>
}

export class MigrationRunner {
  private dbManager: DatabaseManager
  private migrationsPath: string

  constructor(dbManager: DatabaseManager, migrationsPath?: string) {
    this.dbManager = dbManager
    this.migrationsPath = migrationsPath || path.join(__dirname, "migrations")
  }

  async createMigrationsTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    await this.dbManager.exec(sql)
  }

  async getExecutedMigrations(): Promise<string[]> {
    const rows = await this.dbManager.query("SELECT name FROM migrations ORDER BY id")
    return rows.map((row: any) => row.name)
  }

  async loadMigrations(): Promise<Migration[]> {
    const files = fs
      .readdirSync(this.migrationsPath)
      .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
      .sort()

    const migrations: Migration[] = []

    for (const file of files) {
      const migrationPath = path.join(this.migrationsPath, file)
      const migration = await import(migrationPath)

      migrations.push({
        id: migrations.length + 1,
        name: file,
        up: migration.up,
        down: migration.down,
      })
    }

    return migrations
  }

  async runMigrations(): Promise<void> {
    await this.createMigrationsTable()

    const executed = await this.getExecutedMigrations()
    const migrations = await this.loadMigrations()

    for (const migration of migrations) {
      if (!executed.includes(migration.name)) {
        console.log(`Running migration: ${migration.name}`)

        try {
          await migration.up(this.dbManager.getDatabase())
          await this.dbManager.query("INSERT INTO migrations (name) VALUES (?)", [migration.name])
          console.log(`Migration ${migration.name} completed successfully`)
        } catch (error) {
          console.error(`Migration ${migration.name} failed:`, error)
          throw error
        }
      }
    }

    console.log("All migrations completed")
  }

  async rollback(steps = 1): Promise<void> {
    const executed = await this.getExecutedMigrations()
    const migrations = await this.loadMigrations()

    const toRollback = executed.slice(-steps).reverse()

    for (const name of toRollback) {
      const migration = migrations.find((m) => m.name === name)
      if (!migration) continue

      console.log(`Rolling back migration: ${name}`)

      try {
        await migration.down(this.dbManager.getDatabase())
        await this.dbManager.query("DELETE FROM migrations WHERE name = ?", [name])
        console.log(`Migration ${name} rolled back successfully`)
      } catch (error) {
        console.error(`Rollback of ${name} failed:`, error)
        throw error
      }
    }

    console.log(`Rolled back ${toRollback.length} migration(s)`)
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2]
  const config: DatabaseConfig = {
    type: (process.env.DB_TYPE as "mysql" | "sqlite") || "sqlite",
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    filename: process.env.DB_FILENAME,
  }

  const dbManager = new DatabaseManager(config)
  const runner = new MigrationRunner(dbManager)
  ;(async () => {
    try {
      await dbManager.connect()

      switch (command) {
        case "up":
          await runner.runMigrations()
          break
        case "down":
          const steps = Number.parseInt(process.argv[3]) || 1
          await runner.rollback(steps)
          break
        default:
          console.log("Usage: npm run db:migrate [up|down] [steps]")
          process.exit(1)
      }

      await dbManager.disconnect()
    } catch (error) {
      console.error("Migration error:", error)
      process.exit(1)
    }
  })()
}
