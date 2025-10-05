import type { Database } from "../db"
import fs from "fs"
import path from "path"

export async function up(db: Database): Promise<void> {
  console.log("Running migration: 002_seed_data")

  // Read and execute seed data
  const seedSQL = fs.readFileSync(path.join(__dirname, "../seed.sql"), "utf-8")

  await db.exec(seedSQL)

  console.log("Seed data inserted successfully")
}

export async function down(db: Database): Promise<void> {
  console.log("Rolling back migration: 002_seed_data")

  // Clear all data
  const tables = [
    "analytics",
    "system_logs",
    "voice_commands",
    "file_index",
    "code_snippets",
    "chat_messages",
    "chat_sessions",
    "api_keys",
    "users",
    "models",
    "ai_providers",
    "agents",
    "system_config",
  ]

  for (const table of tables) {
    await db.exec(`DELETE FROM ${table}`)
  }

  console.log("Seed data cleared successfully")
}
