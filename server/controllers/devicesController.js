// server/controllers/devicesController.js
const pool = require("../config/db");
const jwt = require("jsonwebtoken");

// Verificar si un token es válido
exports.verifyToken = async (req, res) => {
  try {
    const { token, deviceId } = req.body;

    if (!token || !deviceId) {
      return res.status(400).json({
        success: false,
        message: "Token y ID de dispositivo son requeridos",
      });
    }

    // Verificar firma del JWT
    const jwtSecret = process.env.JWT_SECRET || "your-default-secret-key";

    try {
      // Decodificar y verificar el token
      const decoded = jwt.verify(token, jwtSecret);

      // Verificar si el token corresponde al dispositivo
      if (decoded.deviceId !== deviceId) {
        return res.status(403).json({
          success: false,
          message: "Token no válido para este dispositivo",
        });
      }

      // Verificar si el dispositivo está en la base de datos
      const [deviceRows] = await pool.execute(
        "SELECT * FROM activated_devices WHERE device_id = ? AND token = ?",
        [deviceId, token]
      );

      if (deviceRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Dispositivo no encontrado o token revocado",
        });
      }

      // Actualizar última actividad
      await pool.execute(
        "UPDATE activated_devices SET last_active = CURRENT_TIMESTAMP WHERE device_id = ? AND token = ?",
        [deviceId, token]
      );

      return res.status(200).json({
        success: true,
        premiumAccess: true,
        message: "Token válido",
      });
    } catch (error) {
      // Error al verificar JWT
      return res.status(401).json({
        success: false,
        message: "Token inválido o expirado",
      });
    }
  } catch (error) {
    console.error("Error al verificar token:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
    });
  }
};

// Obtener todos los dispositivos (para el panel admin)
exports.getAllDevices = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM activated_devices ORDER BY activated_at DESC"
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error al obtener dispositivos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener dispositivos activados",
    });
  }
};

// Revocar el acceso de un dispositivo
exports.revokeDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    // Eliminar solo el dispositivo específico
    const [result] = await pool.execute(
      "DELETE FROM activated_devices WHERE device_id = ?",
      [deviceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Dispositivo no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      message: "Acceso del dispositivo revocado exitosamente",
    });
  } catch (error) {
    console.error("Error al revocar dispositivo:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
    });
  }
};
