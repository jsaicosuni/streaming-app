// server/config/db.js
const mysql = require("mysql2/promise");

// Crear un pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "streampro",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Probar la conexión al iniciar
pool
  .getConnection()
  .then((connection) => {
    console.log("Conexión a la base de datos establecida");
    connection.release();
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err);
  });

module.exports = pool;
