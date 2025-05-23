// server/middleware/auth.js
const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
  // Obtener token del header
  const bearerHeader = req.headers.authorization;

  if (!bearerHeader) {
    return res.status(401).json({
      success: false,
      message: "Acceso denegado. Token no proporcionado.",
    });
  }

  try {
    // Extraer token del formato "Bearer token"
    const token = bearerHeader.split(" ")[1];

    // Verificar token
    const jwtSecret = process.env.JWT_SECRET || "your-default-secret-key";
    const decoded = jwt.verify(token, jwtSecret);

    // Verificar si es un admin
    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. Permisos insuficientes.",
      });
    }

    // Añadir usuario decodificado a la request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token inválido o expirado.",
    });
  }
};
