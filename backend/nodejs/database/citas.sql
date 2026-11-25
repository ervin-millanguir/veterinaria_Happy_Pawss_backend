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

DO $$
BEGIN
    IF to_regclass('public.idx_citas_usuario') IS NULL THEN
        EXECUTE 'CREATE INDEX idx_citas_usuario ON public.citas(usuario_id)';
    END IF;

    IF to_regclass('public.idx_citas_servicio') IS NULL THEN
        EXECUTE 'CREATE INDEX idx_citas_servicio ON public.citas(servicio_id)';
    END IF;

    IF to_regclass('public.idx_citas_fecha') IS NULL THEN
        EXECUTE 'CREATE INDEX idx_citas_fecha ON public.citas(fecha)';
    END IF;

    IF to_regclass('public.idx_citas_horario_activo') IS NULL THEN
        EXECUTE 'CREATE UNIQUE INDEX idx_citas_horario_activo
                 ON public.citas(servicio_id, fecha, hora)
                 WHERE estado IN (''Pendiente'', ''Confirmada'')';
    END IF;
END
$$;