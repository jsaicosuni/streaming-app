// server/controllers/streamController.js
const pool = require("../config/db");

// Obtener fuentes de streaming activas (para el reproductor)
exports.getActiveSources = async (req, res) => {
  try {
    // Verificar que el usuario tenga acceso (token válido o período gratuito)
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "ID de dispositivo requerido",
      });
    }

    // Obtener fuentes activas
    const [sources] = await pool.execute(
      "SELECT quality, url FROM streaming_sources WHERE is_active = TRUE ORDER BY quality DESC"
    );

    if (sources.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No hay fuentes de streaming disponibles",
      });
    }

    // Transformar a formato esperado por el frontend
    const videoSources = {};
    sources.forEach((source) => {
      videoSources[source.quality] = source.url;
    });

    res.status(200).json({
      success: true,
      sources: videoSources,
    });
  } catch (error) {
    console.error("Error al obtener fuentes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener fuentes de streaming",
    });
  }
};

// Obtener todas las fuentes (para el panel admin)
exports.getAllSources = async (req, res) => {
  try {
    const [sources] = await pool.execute(
      "SELECT * FROM streaming_sources ORDER BY created_at DESC"
    );

    res.status(200).json({
      success: true,
      data: sources,
    });
  } catch (error) {
    console.error("Error al obtener fuentes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener fuentes",
    });
  }
};

// Agregar nueva fuente
exports.addSource = async (req, res) => {
  try {
    const { name, quality, url, is_active = true } = req.body;

    if (!name || !quality || !url) {
      return res.status(400).json({
        success: false,
        message: "Nombre, calidad y URL son requeridos",
      });
    }

    const [result] = await pool.execute(
      "INSERT INTO streaming_sources (name, quality, url, is_active) VALUES (?, ?, ?, ?)",
      [name, quality, url, is_active]
    );

    res.status(201).json({
      success: true,
      message: "Fuente agregada correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al agregar fuente:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar fuente",
    });
  }
};

// Actualizar fuente
exports.updateSource = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quality, url, is_active } = req.body;

    const [result] = await pool.execute(
      "UPDATE streaming_sources SET name = ?, quality = ?, url = ?, is_active = ? WHERE id = ?",
      [name, quality, url, is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Fuente no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fuente actualizada correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar fuente:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar fuente",
    });
  }
};

// Eliminar fuente
exports.deleteSource = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      "DELETE FROM streaming_sources WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Fuente no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fuente eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar fuente:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar fuente",
    });
  }
};
