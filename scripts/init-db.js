// scripts/init-db.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function initDatabase() {
  console.log("Inicializando base de datos...");

  try {
    // Primero, crear la base de datos si no existe
    const rootConnection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    console.log("Conexión a MySQL establecida");

    // Crear la base de datos
    await rootConnection.query("CREATE DATABASE IF NOT EXISTS streampro");
    console.log("Base de datos creada o ya existente");

    // Cerrar conexión inicial
    await rootConnection.end();

    // Conectar a la base de datos específica
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: "streampro",
      multipleStatements: true,
    });

    console.log("Conectado a la base de datos streampro");

    // Primero eliminar tablas si existen para tener una instalación limpia
    // Nota: El orden es importante debido a las restricciones de clave foránea
    console.log("Eliminando tablas existentes si las hay...");
    try {
      await dbConnection.query("DROP TABLE IF EXISTS activated_devices");
      await dbConnection.query("DROP TABLE IF EXISTS activation_codes");
      console.log("Tablas eliminadas correctamente");
    } catch (dropError) {
      console.log("Error al eliminar tablas:", dropError.message);
    }

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, "..", "database.sql");
    let sqlContent = fs.readFileSync(sqlPath, "utf8");

    // Quitar las líneas CREATE DATABASE y USE que ya manejamos
    sqlContent = sqlContent.replace(/CREATE DATABASE.*?;/gs, "");
    sqlContent = sqlContent.replace(/USE.*?;/gs, "");

    // Ejecutar todas las sentencias juntas
    await dbConnection.query(sqlContent);

    console.log("Tablas e índices creados correctamente");
    console.log("Códigos de prueba insertados");

    await dbConnection.end();

    console.log("Base de datos inicializada correctamente");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
    process.exit(1);
  }
}

initDatabase();
