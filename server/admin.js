// server/admin.js
const express = require("express");
const path = require("path");

// Crear el router
const router = express.Router();

// Configuración de rutas
router.use(express.static(path.join(__dirname, "../admin")));

// Ruta para el índice del admin
router.get("/", (req, res) => {
  console.log("Admin root route accessed");
  const filePath = path.join(__dirname, "../admin/index.html");
  console.log("Serving file:", filePath);
  res.sendFile(filePath);
});

// Ruta para el login
router.get("/login", (req, res) => {
  console.log("Admin login route accessed");
  const filePath = path.join(__dirname, "../admin/login.html");
  console.log("Serving file:", filePath);
  res.sendFile(filePath);
});

// Ruta para la versión standalone
router.get("/standalone", (req, res) => {
  console.log("Admin standalone route accessed");
  const filePath = path.join(__dirname, "../admin/index-standalone.html");
  console.log("Serving file:", filePath);
  res.sendFile(filePath);
});

// Exportar el router
module.exports = router;
