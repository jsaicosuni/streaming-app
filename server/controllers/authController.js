// server/controllers/authController.js
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Intento de login:", { email, password }); // Log para depuración

    // Verificación directa sin bcrypt
    if (email === "admin@streampro.com" && password === "admin123") {
      const jwtSecret = process.env.JWT_SECRET || "your-default-secret-key";
      const payload = {
        id: 1,
        name: "Admin",
        email: email,
        role: "admin",
        isAdmin: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      };

      const token = jwt.sign(payload, jwtSecret);

      console.log("Login exitoso para:", email);

      return res.status(200).json({
        success: true,
        token,
        user: { id: 1, name: "Admin", email, role: "admin" },
      });
    }

    console.log("Credenciales inválidas:", email);
    return res.status(401).json({
      success: false,
      message: "Credenciales inválidas",
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
    });
  }
};

exports.checkAuth = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};
