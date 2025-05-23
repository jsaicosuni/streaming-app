// server/routes/api.js
const express = require("express");
const router = express.Router();
const codesController = require("../controllers/codesController");
const devicesController = require("../controllers/devicesController");
const streamController = require("../controllers/streamController");
const { authMiddleware } = require("../middleware/auth");

// Rutas públicas
router.post("/codes/verify", codesController.verifyCode);
router.post("/devices/verify", devicesController.verifyToken);
router.post("/streaming/sources", streamController.getActiveSources); // NUEVA RUTA

// Rutas protegidas (solo admin)
router.get("/codes", authMiddleware, codesController.getAllCodes);
router.post("/codes/generate", authMiddleware, codesController.generateCodes);
router.post("/codes/:id/disable", authMiddleware, codesController.disableCode);

router.get("/devices", authMiddleware, devicesController.getAllDevices);
router.post(
  "/devices/:deviceId/revoke",
  authMiddleware,
  devicesController.revokeDevice
);

// NUEVAS RUTAS para administrar fuentes
router.get("/streaming/all", authMiddleware, streamController.getAllSources);
router.post("/streaming/add", authMiddleware, streamController.addSource);
router.put("/streaming/:id", authMiddleware, streamController.updateSource);
router.delete("/streaming/:id", authMiddleware, streamController.deleteSource);

module.exports = router;
