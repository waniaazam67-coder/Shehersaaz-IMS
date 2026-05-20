const mysql = require("mysql2/promise");
const config = require("./env");

const requiredDatabaseVars = ["DB_HOST", "DB_NAME", "DB_USER"];
const missingDatabaseVars = requiredDatabaseVars.filter((key) => !process.env[key]);

if (missingDatabaseVars.length) {
  console.warn(`Missing database environment variables: ${missingDatabaseVars.join(", ")}`);
}

const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true
});

async function testDatabaseConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testDatabaseConnection
};
