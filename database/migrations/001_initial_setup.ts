import type { Database } from "../db"
import fs from "fs"
import path from "path"

export async function up(db: Database): Promise<void> {
  console.log("Running migration: 001_initial_setup")

  // Read and execute schema
  const schemaSQL = fs.readFileSync(path.join(__dirname, "../schema.sql"), "utf-8")

  await db.exec(schemaSQL)

  console.log("Schema created successfully")
}

export async function down(db: Database): Promise<void> {
  console.log("Rolling back migration: 001_initial_setup")

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
    await db.exec(`DROP TABLE IF EXISTS ${table}`)
  }

  console.log("Schema dropped successfully")
}
