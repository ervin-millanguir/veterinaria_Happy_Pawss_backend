CREATE TABLE IF NOT EXISTS citas (
    id SERIAL PRIMARY KEY,

    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    servicio_id INTEGER NOT NULL REFERENCES servicios(id),

    nombre_mascota VARCHAR(100) NOT NULL,

    especie VARCHAR(20) NOT NULL
        CHECK (especie IN ('Perro', 'Gato', 'Ave', 'Otro')),

    fecha DATE NOT NULL,
    hora TIME NOT NULL,

    motivo TEXT NOT NULL,

    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
        CHECK (estado IN (
            'Pendiente',
            'Confirmada',
            'Cancelada',
            'Atendida'
        )),

    fecha_solicitud TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_citas_usuario
ON citas(usuario_id);

CREATE INDEX IF NOT EXISTS idx_citas_servicio
ON citas(servicio_id);

CREATE INDEX IF NOT EXISTS idx_citas_fecha
ON citas(fecha);

CREATE UNIQUE INDEX IF NOT EXISTS idx_citas_horario_activo
ON citas(servicio_id, fecha, hora)
WHERE estado IN ('Pendiente', 'Confirmada');