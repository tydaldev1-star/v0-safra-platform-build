import mysql from "mysql2/promise"

// Validate required env vars before creating pool
const MYSQL_HOST = process.env.MYSQL_HOST
const MYSQL_USER = process.env.MYSQL_USER
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD
const MYSQL_DATABASE = process.env.MYSQL_DATABASE
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || "3306")

if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_DATABASE) {
  console.warn("Warning: MySQL environment variables are not fully configured. DB queries will fail.")
}

// Create a connection pool
const pool = mysql.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  port: MYSQL_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000,
})

export default pool

// Helper function to execute queries
export async function query<T = unknown>(sql: string, params?: unknown[]): Promise<T> {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows as T
  } catch (error: any) {
    console.error("[v0] DB query error:", error?.message || error)
    throw error
  }
}

// Transaction helper
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection()
  await connection.beginTransaction()
  try {
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
