-- Migración aditiva para compatibilizar usuarios de EP3 y Guía 19.
-- No elimina ni renombra datos ni cambia roles existentes.

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(40) NOT NULL UNIQUE
);

INSERT INTO roles (nombre)
VALUES
  ('CLIENTE'),
  ('ADMIN'),
  ('dueno_mascota'),
  ('administrador'),
  ('recepcionista')
ON CONFLICT (nombre) DO NOTHING;

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  apellido VARCHAR(120) NOT NULL,
  rut VARCHAR(15),
  correo VARCHAR(254) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  contrasena_hash VARCHAR(255),
  contrasena VARCHAR(255),
  rol_id INTEGER NOT NULL REFERENCES roles(id),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_registro TIMESTAMP,
  creado_en TIMESTAMPTZ
);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rut VARCHAR(15);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS contrasena_hash VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS contrasena VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ;

ALTER TABLE usuarios ALTER COLUMN nombre TYPE VARCHAR(120);
ALTER TABLE usuarios ALTER COLUMN apellido TYPE VARCHAR(120);
ALTER TABLE usuarios ALTER COLUMN correo TYPE VARCHAR(254);
ALTER TABLE usuarios ALTER COLUMN rut DROP NOT NULL;
ALTER TABLE usuarios ALTER COLUMN telefono DROP NOT NULL;

UPDATE usuarios
SET contrasena_hash = contrasena
WHERE contrasena_hash IS NULL AND contrasena IS NOT NULL;

UPDATE usuarios
SET contrasena = contrasena_hash
WHERE contrasena IS NULL AND contrasena_hash IS NOT NULL;

UPDATE usuarios
SET fecha_registro = creado_en::timestamp
WHERE fecha_registro IS NULL AND creado_en IS NOT NULL;

UPDATE usuarios
SET creado_en = fecha_registro::timestamptz
WHERE creado_en IS NULL AND fecha_registro IS NOT NULL;

ALTER TABLE usuarios
  ALTER COLUMN fecha_registro SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE usuarios
  ALTER COLUMN creado_en SET DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_rut
ON usuarios (rut)
WHERE rut IS NOT NULL;
