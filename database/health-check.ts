import type { DatabaseManager } from "./db"

export interface HealthCheckResult {
  status: "healthy" | "unhealthy"
  responseTime: number
  error?: string
  details?: {
    type: string
    connected: boolean
    tablesCount?: number
  }
}

/**
 * Perform database health check
 */
export async function checkDatabaseHealth(db: DatabaseManager): Promise<HealthCheckResult> {
  const startTime = Date.now()

  try {
    // Try a simple query
    await db.query("SELECT 1 as health_check")

    // Get table count
    const tables = await db.query(`
      SELECT COUNT(*) as count 
      FROM sqlite_master 
      WHERE type='table'
    `)

    const responseTime = Date.now() - startTime

    return {
      status: "healthy",
      responseTime,
      details: {
        type: db.getConfig().type,
        connected: true,
        tablesCount: tables[0]?.count || 0,
      },
    }
  } catch (error) {
    const responseTime = Date.now() - startTime

    return {
      status: "unhealthy",
      responseTime,
      error: error instanceof Error ? error.message : "Unknown error",
      details: {
        type: db.getConfig().type,
        connected: false,
      },
    }
  }
}

/**
 * Monitor database connection with periodic health checks
 */
export class DatabaseMonitor {
  private db: DatabaseManager
  private interval: NodeJS.Timeout | null = null
  private checkIntervalMs: number
  private onHealthChange?: (result: HealthCheckResult) => void

  constructor(db: DatabaseManager, checkIntervalMs = 30000, onHealthChange?: (result: HealthCheckResult) => void) {
    this.db = db
    this.checkIntervalMs = checkIntervalMs
    this.onHealthChange = onHealthChange
  }

  start(): void {
    if (this.interval) {
      return
    }

    this.interval = setInterval(async () => {
      const result = await checkDatabaseHealth(this.db)

      if (this.onHealthChange) {
        this.onHealthChange(result)
      }

      if (result.status === "unhealthy") {
        console.error("[DB Monitor] Database unhealthy:", result.error)
      }
    }, this.checkIntervalMs)

    console.log(`[DB Monitor] Started monitoring (interval: ${this.checkIntervalMs}ms)`)
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
      console.log("[DB Monitor] Stopped monitoring")
    }
  }

  async checkNow(): Promise<HealthCheckResult> {
    return checkDatabaseHealth(this.db)
  }
}
