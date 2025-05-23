// server.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Ruta de prueba
app.get("/test", (req, res) => {
  res.json({ message: "El servidor está funcionando correctamente" });
});

// Cargar rutas
const apiRoutes = require("./server/routes/api");
const adminRoutes = require("./server/routes/admin");

// Usar rutas
app.use("/api", apiRoutes);
app.use("/admin", adminRoutes);

// Servir aplicación frontend para cualquier otra ruta
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error("Error no controlado:", err.stack);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
