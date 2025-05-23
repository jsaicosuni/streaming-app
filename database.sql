-- Tabla de códigos de activación
CREATE TABLE IF NOT EXISTS activation_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  created_by VARCHAR(36) DEFAULT NULL,
  status ENUM('active', 'used', 'expired') NOT NULL DEFAULT 'active',
  usage_count INT NOT NULL DEFAULT 0,
  usage_limit INT NOT NULL DEFAULT 1,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de dispositivos activados
CREATE TABLE IF NOT EXISTS activated_devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(100) NOT NULL,
  activation_code VARCHAR(20) NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(45),
  token VARCHAR(255) NOT NULL,
  status ENUM('active', 'revoked') NOT NULL DEFAULT 'active',
  activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (activation_code) REFERENCES activation_codes(code) ON DELETE CASCADE
);

-- Índices para búsquedas comunes
CREATE INDEX idx_device_id ON activated_devices(device_id);
CREATE INDEX idx_token ON activated_devices(token);
CREATE INDEX idx_code ON activation_codes(code);

-- Insertar códigos de prueba
INSERT INTO activation_codes (code, status, usage_limit, expires_at) 
VALUES 
('CODE-0001', 'active', 1, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('CODE-0004', 'active', 1, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('CODE-0005', 'active', 1, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('CODE-0007', 'active', 1, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('CODE-0009', 'active', 1, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('hoy9Y3R-KA6Y', 'active', 1, DATE_ADD(NOW(), INTERVAL 30 DAY));