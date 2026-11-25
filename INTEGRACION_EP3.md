# Happy Paws · Integración EP3 (25 de noviembre 2026)

## Qué viene incluido en este paquete

**Tecnología del backend principal:** Node.js + Express + PostgreSQL. La carpeta `backend/springboot/` del repositorio es un ejemplo mínimo y **no** es el backend de usuarios del paquete.

- `POST /api/auth/registro`: registro público con rol `dueno_mascota` impuesto por servidor, BCrypt.
- `POST /api/auth/login`: JWT firmado, 2 horas.
- `GET /api/auth/me`: valida JWT contra la base actual, rechaza cuentas inactivas.
- `GET /api/usuarios`: listado solo administrador.
- `POST /api/usuarios`: alta con rol asignado solo por administrador.
- `GET /api/usuarios/:id`: propietario o administrador.
- `PUT /api/usuarios/:id`: datos propios o cualquiera siendo administrador; solo administrador puede cambiar rol/estado.
- `DELETE /api/usuarios/:id`: desactivación lógica, 204, solo administrador.
- `PATCH /api/usuarios/:id/desactivar`: compatibilidad con la API anterior.
- CRUD de productos y servicios ya existentes, con mutaciones protegidas para administrador.
- Swagger: `/api/docs` (documentación), `/api/docs.json` (OpenAPI).

## Requisitos críticos antes de presentarlo

1. Ejecutar `backend/nodejs/database/schema.sql` (productos y servicios) y `backend/nodejs/database/usuarios_roles.sql` en la MISMA base de datos PostgreSQL, con un usuario SQL autorizado.
2. Si las tablas `usuarios` y `roles` ya existen, comprobar sus columnas antes de ejecutar el script; `CREATE TABLE IF NOT EXISTS` no migra una estructura antigua.
3. En `backend/nodejs`: `npm ci`; copiar `.env.example` a `.env` y configurar DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL, JWT_SECRET, CORS_ORIGINS.
4. `JWT_SECRET` debe tener al menos 32 caracteres y mantenerse igual entre reinicios o los JWT anteriores caducarán por cambio de firma.
5. Iniciar con `npm start`, y el frontend con `npm ci` + `npm run dev` después de configurar `VITE_API_URL` en `.env.local`.
6. No publicar `.env`, `.pem`, tokens ni credenciales en GitHub.

## Crear el primer administrador: operación excepcional de arranque

El registro público **nunca** permite elegir `administrador`. Para inicializar un entorno de prueba, registrar un usuario ficticio y ejecutar, mediante acceso SQL autorizado:

```sql
UPDATE usuarios
SET rol_id = (SELECT id FROM roles WHERE nombre = 'administrador')
WHERE correo = 'admin.demo@example.com';
```

Comprobar que se actualizó exactamente una fila y volver a iniciar sesión. Sustituir el correo del ejemplo por la cuenta de prueba creada. No ejecutar indiscriminadamente sobre cuentas de terceros.

## Nota de alcance

Este parche se generó a partir de los ZIP enviados; su integración con la base AWS de los compañeros **no está probada**. No se ejecutaron pruebas funcionales contra PostgreSQL ni se desplegó en EC2. El módulo de citas del frontend recibido usa `localStorage`, no PostgreSQL; todavía NO satisface el flujo principal de citas ni su restricción 409 del caso veterinaria. No presentarlo como implementado. El trabajo de hoy se centró en autenticación, gestión de usuarios, roles, front protegido y Swagger.
