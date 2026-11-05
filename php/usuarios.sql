-- Tabla de usuarios para el login (base bdfacturas)
-- Categorías:
--   0 = Invitado (sin iniciar sesión, no se guarda en la tabla)
--   1 = Usuario  -> ve todo el sistema (clientes, ventas, sucursales completas)
--   2 = Administrador -> además puede dar de alta, modificar y borrar
--
-- Usuarios de prueba (usuario / contraseña):
--   usuario / usuario123   (categoría 1)
--   admin   / admin123     (categoría 2)
-- Las contraseñas se guardan encriptadas con password_hash() de PHP.

USE bdfacturas;

CREATE TABLE IF NOT EXISTS usuarios (
  idUsuario INT(11) NOT NULL AUTO_INCREMENT,
  usuario   VARCHAR(50)  NOT NULL,
  clave     VARCHAR(255) NOT NULL,
  nombre    VARCHAR(100) NOT NULL,
  categoria TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (idUsuario),
  UNIQUE KEY uk_usuario (usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO usuarios (usuario, clave, nombre, categoria) VALUES
  ('usuario', '$2y$10$1QTjG09NpcUkgj0tYmVU5uSJ/drWkHjeUvZYi9uvRNtGaHqmCmI1W', 'Usuario de prueba', 1),
  ('admin',   '$2y$10$jUS37ECrOVRnbzAGNgt6EuiX/tQmityg/dzudtX9MywoGHFUGdWxG', 'Administrador', 2);
