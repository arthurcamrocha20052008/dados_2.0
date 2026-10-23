import mysql from 'mysql2/promise'

declare global {
  // Evita múltiplas conexões simultâneas em modo de desenvolvimento (Hot Reload)
  var _mysqlPool: mysql.Pool | undefined
}

export const dbPool: mysql.Pool =
  global._mysqlPool ??
  mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'dashboard_magico',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })

if (process.env.NODE_ENV !== 'production') {
  global._mysqlPool = dbPool
}
