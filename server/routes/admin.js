// server/routes/admin.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authMiddleware } = require("../middleware/auth");

// Rutas de autenticación
router.post("/login", authController.login);
router.get("/check-auth", authMiddleware, authController.checkAuth);

module.exports = router;
