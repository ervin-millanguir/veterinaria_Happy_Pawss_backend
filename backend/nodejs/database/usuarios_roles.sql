-- Ejecutar en la base happy_paws antes del primer registro.
-- No borra ni modifica cuentas preexistentes.
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(40) NOT NULL UNIQUE
);
INSERT INTO roles(nombre) VALUES ('administrador'), ('recepcionista'), ('dueno_mascota')
ON CONFLICT (nombre) DO NOTHING;

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  apellido VARCHAR(120) NOT NULL,
  correo VARCHAR(254) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  rol_id INTEGER NOT NULL REFERENCES roles(id),
  activo BOOLEAN NOT NULL DEFAULT true,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Si ya existían las tablas, revisar manualmente que sus columnas coincidan.
-- Nunca eleves usuarios a administrador en el endpoint público de registro.
-- Primer admin: registrar una cuenta de prueba y luego, desde psql autorizado:
-- UPDATE usuarios SET rol_id=(SELECT id FROM roles WHERE nombre='administrador')
-- WHERE correo='admin.demo@example.com';
