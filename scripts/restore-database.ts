import { getDatabase } from "../database/connection-pool"
import { restoreBackup, listBackups } from "../database/backup"

async function main() {
  const backupPath = process.argv[2]

  if (!backupPath) {
    console.log("Usage: npm run db:restore <backup-file>")
    console.log("\nAvailable backups:")
    const backups = listBackups()
    backups.forEach((backup) => console.log(`  - ${backup}`))
    process.exit(1)
  }

  try {
    const db = await getDatabase()
    await restoreBackup(db, backupPath)
    console.log(`✓ Database restored successfully from: ${backupPath}`)
    process.exit(0)
  } catch (error) {
    console.error("✗ Restore failed:", error)
    process.exit(1)
  }
}

main()
