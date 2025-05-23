// server.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS más permisiva para desarrollo
app.use(
  cors({
    origin: "*", // En producción, limita esto a tu dominio
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware para procesar JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Ruta de prueba para verificar que el servidor está funcionando
app.get("/test", (req, res) => {
  res.json({ message: "El servidor está funcionando correctamente" });
});

// Ruta de prueba para autenticación
app.post("/test-auth", (req, res) => {
  const { email, password } = req.body;
  console.log("Test auth:", { email, password });

  if (email === "admin@streampro.com" && password === "admin123") {
    res.json({ success: true, message: "Autenticación correcta" });
  } else {
    res.status(401).json({
      success: false,
      message: "Credenciales incorrectas",
      received: { email, password },
    });
  }
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
