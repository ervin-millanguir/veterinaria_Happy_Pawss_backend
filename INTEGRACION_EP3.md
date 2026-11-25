# Happy Paws · Integración EP3 (25 de noviembre 2026)

## Qué viene incluido en este paquete

**Tecnología del backend principal:** Node.js + Express + PostgreSQL. La carpeta `backend/springboot/` del repositorio es un ejemplo mínimo y **no** es el backend de usuarios del paquete.

- `POST /api/auth/registro`: registro público con rol `dueno_mascota` impuesto por servidor y contraseña BCrypt.
- `POST /api/auth/register`: ruta de compatibilidad que registra con rol `CLIENTE`.
- `POST /api/auth/login`: JWT firmado con HS256 y duración predeterminada de una hora.
- `GET /api/auth/me`: valida JWT contra la base actual, rechaza cuentas inactivas.
- `GET /api/usuarios`: listado solo administrador.
- `POST /api/usuarios`: alta con rol asignado solo por administrador.
- `GET /api/usuarios/:id`: propietario o administrador.
- `PUT /api/usuarios/:id`: datos propios o cualquiera siendo administrador; solo administrador puede cambiar rol/estado.
- `DELETE /api/usuarios/:id`: desactivación lógica, 204, solo administrador.
- `PATCH /api/usuarios/:id/desactivar`: compatibilidad con la API anterior.
- CRUD de productos y servicios ya existentes, con mutaciones protegidas para administrador.
- Recuperación de citas veterinarias con autorización por rol y propiedad.
- Roles compatibles: `ADMIN`/`administrador`, `CLIENTE`/`dueno_mascota` y `recepcionista`.
- Los campos `rut`, `telefono`, `contrasena_hash`, `contrasena`, `fecha_registro` y `creado_en` se preservan para compatibilidad con ambas estructuras.
- Swagger: `/api/docs` y `/api-docs`; JSON en `/api/docs.json` y `/api-docs.json`.

## Requisitos críticos antes de presentarlo

1. Respaldar la base de datos y aplicar en este orden `auth.sql`, `usuarios_roles.sql`, `schema.sql` y `citas.sql`. La migración de usuarios es aditiva; validar primero en una base local de pruebas. No ejecutar contra producción sin ventana y respaldo aprobados.
2. Ejecutar los scripts con un usuario PostgreSQL que posea los objetos o disponga de privilegios suficientes. La aplicación requiere acceso a roles, usuarios, productos, servicios, citas y sus secuencias.
3. En `backend/nodejs`: `npm ci`; crear `.env` desde `.env.example` solo si no existe. Las pruebas usan el archivo independiente `.env.test`, creado desde `.env.test.example`; completar ahí las credenciales locales sin modificar `.env`. Para pruebas, `DB_HOST` debe ser `localhost` o `127.0.0.1` y `DB_NAME` debe ser `happy_paws_test`.
4. `JWT_SECRET` debe tener al menos 32 caracteres y mantenerse igual entre reinicios. Configurar emisor y audiencia coherentes; los tokens EP3 anteriores sin estos claims requerirán iniciar sesión nuevamente si estos valores están habilitados.
5. Iniciar con `npm start`, y el frontend con `npm ci` + `npm run dev` después de configurar `VITE_API_URL` en `.env.local`.
6. Para Amazon RDS activar `DB_SSL=true`, proporcionar el certificado CA mediante `DB_CA_PATH` y conservar `rejectUnauthorized=true`. Para PostgreSQL local usar `DB_SSL=false`.
7. No publicar `.env`, `.pem`, tokens ni credenciales en GitHub.

## Crear el primer administrador: operación excepcional de arranque

El registro público **nunca** permite elegir `administrador`. Para inicializar un entorno de prueba, registrar un usuario ficticio y ejecutar, mediante acceso SQL autorizado:

```sql
UPDATE usuarios
SET rol_id = (SELECT id FROM roles WHERE nombre = 'administrador')
WHERE correo = 'admin.demo@example.com';
```

Comprobar que se actualizó exactamente una fila y volver a iniciar sesión. Sustituir el correo del ejemplo por la cuenta de prueba creada. No ejecutar indiscriminadamente sobre cuentas de terceros.

## Nota de alcance

La suite `backend/nodejs/tests/api.test.js` cancela su ejecución antes de conectarse si `DB_HOST` no es exactamente `localhost` o `127.0.0.1`, o si `DB_NAME` no es `happy_paws_test`. La evidencia previa de Guía 19 registra 22 pruebas aprobadas y 0 fallidas. La validación funcional de integración ejecutada el 25 de noviembre de 2026 obtuvo 29 aprobadas y 0 fallidas, incluyendo CRUD de usuarios, validación JWT y Swagger. No se ha desplegado ni verificado esta integración en AWS o Amazon RDS. El frontend de citas debe apuntar a la API para persistir información en PostgreSQL; la integración frontend-backend sigue pendiente.

La automatización futura se prepara en `.github/workflows/ci.yml` y `deploy/happy-paws.service.example`. Estos archivos no se han usado para desplegar en AWS.
