import type { DatabaseManager } from "./db"
import fs from "fs"
import path from "path"

export interface BackupOptions {
  outputDir?: string
  filename?: string
  compress?: boolean
}

/**
 * Create a database backup
 */
export async function createBackup(db: DatabaseManager, options: BackupOptions = {}): Promise<string> {
  const config = db.getConfig()

  if (config.type !== "sqlite") {
    throw new Error("Backup currently only supported for SQLite databases")
  }

  const outputDir = options.outputDir || "./backups"
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const filename = options.filename || `backup-${timestamp}.db`
  const backupPath = path.join(outputDir, filename)

  // Ensure backup directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Copy SQLite database file
  if (config.filename) {
    fs.copyFileSync(config.filename, backupPath)
    console.log(`[Backup] Created backup: ${backupPath}`)
    return backupPath
  }

  throw new Error("SQLite filename not configured")
}

/**
 * Restore database from backup
 */
export async function restoreBackup(db: DatabaseManager, backupPath: string): Promise<void> {
  const config = db.getConfig()

  if (config.type !== "sqlite") {
    throw new Error("Restore currently only supported for SQLite databases")
  }

  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`)
  }

  // Disconnect before restoring
  await db.disconnect()

  // Restore backup
  if (config.filename) {
    fs.copyFileSync(backupPath, config.filename)
    console.log(`[Restore] Restored from backup: ${backupPath}`)

    // Reconnect
    await db.connect()
  } else {
    throw new Error("SQLite filename not configured")
  }
}

/**
 * List available backups
 */
export function listBackups(backupDir = "./backups"): string[] {
  if (!fs.existsSync(backupDir)) {
    return []
  }

  return fs
    .readdirSync(backupDir)
    .filter((file) => file.endsWith(".db"))
    .sort()
    .reverse()
}

/**
 * Delete old backups, keeping only the most recent N backups
 */
export function cleanupOldBackups(backupDir = "./backups", keepCount = 5): number {
  const backups = listBackups(backupDir)
  const toDelete = backups.slice(keepCount)

  for (const backup of toDelete) {
    const backupPath = path.join(backupDir, backup)
    fs.unlinkSync(backupPath)
    console.log(`[Cleanup] Deleted old backup: ${backup}`)
  }

  return toDelete.length
}
