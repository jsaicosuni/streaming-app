// server/routes/devices.js
const express = require("express");
const devicesController = require("../controllers/devicesController");
const router = express.Router();

// Rutas para dispositivos
router.post("/verify", devicesController.verifyToken);
router.get("/", devicesController.getAllDevices);
router.put("/:deviceId/revoke", devicesController.revokeDevice);

module.exports = router;
