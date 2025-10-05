import { getDatabase } from "../database/connection-pool"
import { createBackup } from "../database/backup"

async function main() {
  try {
    const db = await getDatabase()
    const backupPath = await createBackup(db, {
      outputDir: process.env.BACKUP_DIR || "./backups",
    })
    console.log(`✓ Backup created successfully: ${backupPath}`)
    process.exit(0)
  } catch (error) {
    console.error("✗ Backup failed:", error)
    process.exit(1)
  }
}

main()
