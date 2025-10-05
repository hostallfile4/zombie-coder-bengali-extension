import { getDatabase } from "../database/connection-pool"
import { checkDatabaseHealth } from "../database/health-check"

async function main() {
  try {
    const db = await getDatabase()
    const health = await checkDatabaseHealth(db)

    console.log("\n=== Database Health Check ===")
    console.log(`Status: ${health.status}`)
    console.log(`Response Time: ${health.responseTime}ms`)
    console.log(`Type: ${health.details?.type}`)
    console.log(`Connected: ${health.details?.connected}`)
    console.log(`Tables: ${health.details?.tablesCount}`)

    if (health.error) {
      console.error(`Error: ${health.error}`)
    }

    process.exit(health.status === "healthy" ? 0 : 1)
  } catch (error) {
    console.error("✗ Health check failed:", error)
    process.exit(1)
  }
}

main()
