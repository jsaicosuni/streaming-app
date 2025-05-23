// server/controllers/codesController.js
const pool = require("../config/db");
const jwt = require("jsonwebtoken");

// Verificar y activar un código
exports.verifyCode = async (req, res) => {
  try {
    const { code, deviceId } = req.body;

    if (!code || !deviceId) {
      return res.status(400).json({
        success: false,
        message: "Código y ID de dispositivo son requeridos",
      });
    }

    // Buscar el código en la base de datos
    const [codeRows] = await pool.execute(
      "SELECT * FROM activation_codes WHERE code = ?",
      [code]
    );

    if (codeRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Código no encontrado",
      });
    }

    const codeData = codeRows[0];

    // Verificar si el código está activo
    if (codeData.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Código ya utilizado o expirado",
      });
    }

    // Verificar límite de uso
    if (codeData.usage_count >= codeData.usage_limit) {
      return res.status(400).json({
        success: false,
        message: "Código ha alcanzado su límite de uso",
      });
    }

    // Verificar expiración
    const now = new Date();
    const expiresAt = new Date(codeData.expires_at);

    if (now > expiresAt) {
      // Actualizar estado a expirado
      await pool.execute(
        'UPDATE activation_codes SET status = "expired" WHERE code = ?',
        [code]
      );

      return res.status(400).json({
        success: false,
        message: "Código expirado",
      });
    }

    // Verificar si el dispositivo ya usó este código
    const [deviceRows] = await pool.execute(
      "SELECT * FROM activated_devices WHERE device_id = ? AND activation_code = ?",
      [deviceId, code]
    );

    if (deviceRows.length > 0) {
      // El dispositivo ya usó este código, verificar si sigue activo
      const deviceData = deviceRows[0];

      if (deviceData.status === "active") {
        // Generar un nuevo token
        const jwtSecret = process.env.JWT_SECRET || "your-default-secret-key";
        const payload = {
          deviceId,
          code,
          premiumAccess: true,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 días
        };

        const token = jwt.sign(payload, jwtSecret);

        // Actualizar token y fecha de última actividad
        await pool.execute(
          "UPDATE activated_devices SET token = ?, last_active = CURRENT_TIMESTAMP WHERE device_id = ? AND activation_code = ?",
          [token, deviceId, code]
        );

        return res.status(200).json({
          success: true,
          token,
          expiresAt: codeData.expires_at,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "El acceso para este dispositivo ha sido revocado",
        });
      }
    }

    // Generar token JWT
    const jwtSecret = process.env.JWT_SECRET || "your-default-secret-key";
    const payload = {
      deviceId,
      code,
      premiumAccess: true,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 días
    };

    const token = jwt.sign(payload, jwtSecret);

    // Registrar dispositivo activado
    const userAgent = req.headers["user-agent"] || "";
    const ipAddress = req.ip || req.connection.remoteAddress;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Registrar dispositivo
      await connection.execute(
        "INSERT INTO activated_devices (device_id, activation_code, user_agent, ip_address, token) VALUES (?, ?, ?, ?, ?)",
        [deviceId, code, userAgent, ipAddress, token]
      );

      // Actualizar contador de uso del código
      await connection.execute(
        "UPDATE activation_codes SET usage_count = usage_count + 1 WHERE code = ?",
        [code]
      );

      // Si el código llega a su límite, marcarlo como usado
      if (codeData.usage_count + 1 >= codeData.usage_limit) {
        await connection.execute(
          'UPDATE activation_codes SET status = "used" WHERE code = ?',
          [code]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    res.status(200).json({
      success: true,
      token,
      expiresAt: codeData.expires_at,
    });
  } catch (error) {
    console.error("Error al verificar código:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
    });
  }
};

// Obtener todos los códigos (para el panel admin)
exports.getAllCodes = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM activation_codes ORDER BY created_at DESC"
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error al obtener códigos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener códigos de activación",
    });
  }
};

// Generar nuevos códigos
exports.generateCodes = async (req, res) => {
  try {
    const {
      count = 10,
      usageLimit = 1,
      expiryDays = 30,
      prefix = "",
    } = req.body;

    // Función para generar un código único
    function generateUniqueCode(prefix) {
      const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const length = 8;
      let result = "";

      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
      }

      // Añadir guión para mejor legibilidad
      const formattedCode = `${result.slice(0, 4)}-${result.slice(4, 8)}`;
      return prefix ? `${prefix}${formattedCode}` : formattedCode;
    }

    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Generar códigos
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(generateUniqueCode(prefix));
    }

    // Insertar códigos en la base de datos
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const code of codes) {
        await connection.execute(
          "INSERT INTO activation_codes (code, usage_limit, expires_at) VALUES (?, ?, ?)",
          [code, usageLimit, expiresAt]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    res.status(201).json({
      success: true,
      message: `${count} códigos generados exitosamente`,
      data: { codes },
    });
  } catch (error) {
    console.error("Error al generar códigos:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar códigos",
    });
  }
};

// Desactivar un código
exports.disableCode = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'UPDATE activation_codes SET status = "expired" WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Código no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      message: "Código desactivado correctamente",
    });
  } catch (error) {
    console.error("Error al desactivar código:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
    });
  }
};
