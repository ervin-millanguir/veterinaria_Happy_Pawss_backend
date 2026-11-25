# 🐾 Happy Paws — Backend API

API REST desarrollada para la gestión de productos y servicios veterinarios de Happy Paws, utilizando Node.js, Express, PostgreSQL y AWS Lambda.

Proyecto académico correspondiente a la asignatura DSY1104.

## 1. Tecnologías utilizadas

- Node.js 24.
- Express.js 5.3.0.
- PostgreSQL 16.
- JavaScript.
- AWS EC2 (Ubuntu).
- AWS Lambda.
- Amazon RDS PostgreSQL (integración pendiente).
- Git y GitHub.
- Node.js Test Runner.
- Postman.
- Visual Studio Code.

## 2. Estructura del proyecto

```text
veterinaria_Happy_Pawss_backend/
├── backend/
│   ├── nodejs/
│   │   ├── database/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── server.js
│   ├── lambda/
│   │   ├── database.mjs
│   │   ├── index.mjs
│   │   ├── test.mjs
│   │   ├── test-db.mjs
│   │   ├── test-productos.mjs
│   │   ├── test-consulta.mjs
│   │   ├── .env.example
│   │   └── package.json
│   └── springboot/
├── evidencias/
├── .gitignore
└── README.md
```

## 3. Funcionalidades

### Gestión de productos

- Registrar productos.
- Consultar todos los productos.
- Buscar productos por ID.
- Actualizar productos.
- Eliminar productos.

Cada producto contiene ID, nombre, precio y stock.

### Gestión de servicios veterinarios

- Registrar servicios.
- Consultar todos los servicios.
- Buscar servicios por ID.
- Actualizar servicios.
- Eliminar servicios.

Cada servicio contiene ID, nombre, descripción y precio.

### AWS Lambda

- Generar saludos personalizados.
- Registrar productos.
- Consultar productos.
- Conectarse a PostgreSQL.
- Compartir información con el backend Express mediante una base de datos común.

## 4. Instalación del backend Express

### 4.1. Clonar el repositorio

```bash
git clone https://github.com/ervin-millanguir/veterinaria_Happy_Pawss_backend.git
cd veterinaria_Happy_Pawss_backend/backend/nodejs
```

### 4.2. Instalar dependencias

```bash
npm ci
```

### 4.3. Configurar PostgreSQL

Crear las siguientes bases de datos:

- `happy_paws`: base de datos principal.
- `happy_paws_test`: base de datos independiente para pruebas.

Ejecutar el esquema SQL:

```bash
psql -U happy_paws_app -d happy_paws -f database/schema.sql
psql -U happy_paws_app -d happy_paws_test -f database/schema.sql
```

El usuario debe disponer de los permisos necesarios sobre ambas bases de datos.

### 4.4. Configurar variables de entorno

Crear un archivo `.env` dentro de `backend/nodejs/`.

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=happy_paws_app
DB_PASSWORD=REEMPLAZAR_CON_CONTRASENA_SEGURA
DB_NAME=happy_paws
DB_SSL=false
```

Para Amazon RDS se deberá utilizar el endpoint correspondiente, activar `DB_SSL=true` y disponer del certificado SSL de Amazon RDS.

Nunca publicar las credenciales ni el archivo `.env` en GitHub.

### 4.5. Iniciar el servidor

```bash
npm start
```

Configuración del servidor:

- Host: `0.0.0.0`.
- Puerto: `3000`.
- Dirección local: `http://localhost:3000`.

## 5. Endpoints

### Productos — Express

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/productos` | Listar productos |
| GET | `/api/productos/:id` | Buscar producto |
| POST | `/api/productos` | Crear producto |
| PUT | `/api/productos/:id` | Actualizar producto |
| DELETE | `/api/productos/:id` | Eliminar producto |

### Servicios — Express

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/servicios` | Listar servicios |
| GET | `/api/servicios/:id` | Buscar servicio |
| POST | `/api/servicios` | Crear servicio |
| PUT | `/api/servicios/:id` | Actualizar servicio |
| DELETE | `/api/servicios/:id` | Eliminar servicio |

### Saludo — Express

```text
GET /api/saludo?nombre=Duoc
```

Respuesta esperada:

```json
{
  "mensaje": "Hola, Duoc",
  "backend": "Node.js + Express en EC2",
  "lenguaje": "Node.js",
  "estado": "OK"
}
```

### Rutas implementadas en Lambda

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Saludo personalizado |
| GET | `/api/saludo` | Saludo personalizado |
| GET | `/api/productos` | Consultar productos |
| POST | `/api/productos` | Registrar producto |

Estas rutas se encuentran implementadas y verificadas localmente. Su disponibilidad mediante una Function URL de AWS está pendiente de configuración.

## 6. Base de datos

El proyecto utiliza PostgreSQL para almacenar información de manera persistente.

El archivo `backend/nodejs/database/schema.sql` contiene la estructura de las tablas:

- `productos`.
- `servicios`.

Las operaciones utilizan consultas SQL parametrizadas para reducir el riesgo de inyección SQL.

La arquitectura final contempla una instancia privada de Amazon RDS PostgreSQL compartida entre Express y AWS Lambda.

## 7. Pruebas automatizadas

El backend Express utiliza el sistema de pruebas integrado de Node.js.

```bash
npm test
```

Las pruebas utilizan la base de datos independiente `happy_paws_test`.

### Registro histórico de resultados — 24/11/2026

Este bloque conserva un resultado anterior de 5 pruebas; no corresponde a la última ejecución local informada para la Guía 19. La evidencia archivada `evidencias/pruebas-automatizadas.txt` registra otra ejecución histórica de 10 pruebas.

| Prueba | Resultado |
|---|---|
| GET /api/saludo | Aprobada |
| CRUD completo de productos | Aprobada |
| Validación de producto inválido | Aprobada |
| CRUD completo de servicios | Aprobada |
| Validación de servicio inválido | Aprobada |

- Pruebas ejecutadas: 5.
- Pruebas aprobadas: 5.
- Pruebas fallidas: 0.
- Vulnerabilidades detectadas por npm durante la actualización de Express: 0.
- Versión de Express: 5.3.0.

## 8. Desarrollo de AWS Lambda

La función Lambda se encuentra desarrollada dentro de `backend/lambda/`.

### Instalación de dependencias

```bash
cd backend/lambda
npm ci
```

### Configuración

Crear el archivo `.env` utilizando `.env.example` como referencia y configurar las credenciales correspondientes al entorno de pruebas.

### Pruebas locales

```bash
node --env-file=.env test.mjs
node --env-file=.env test-db.mjs
node --env-file=.env test-productos.mjs
node --env-file=.env test-consulta.mjs
```

### Resultado de la prueba de saludo

Código de respuesta: HTTP 200.

```json
{
  "mensaje": "Hola, Duoc UC",
  "backend": "AWS Lambda",
  "lenguaje": "Node.js"
}
```

### Paquete de despliegue

Se generó localmente el archivo `happy-paws-lambda.zip`, que contiene:

- Código de la función Lambda.
- Configuración de PostgreSQL.
- Dependencias de Node.js.
- Certificado SSL de Amazon RDS.
- Archivos de configuración de dependencias.

El paquete no contiene el archivo `.env` y se encuentra excluido del repositorio mediante `.gitignore`.

Su carga y ejecución en AWS están pendientes.

## 9. Validación cruzada entre Express y Lambda

Se realizaron pruebas utilizando una misma base de datos PostgreSQL local para verificar la interoperabilidad de ambos backends.

| Producto | Backend de registro | Precio | Stock |
|---|---|---:|---:|
| Alimento de prueba Lambda | Lambda | $15.990 | 20 |
| Alimento de prueba Express | Express | $12.990 | 15 |

### Resultados

- Lambda registró un producto que posteriormente fue consultado mediante Express.
- Express registró un producto que posteriormente fue consultado mediante Lambda.
- Ambos backends accedieron correctamente a la misma base de datos.
- Las operaciones de consulta finalizaron correctamente con código HTTP 200.

Esta validación demuestra la interoperabilidad en el entorno local. La validación definitiva deberá repetirse utilizando Amazon RDS.

## 10. Arquitectura propuesta en AWS

### Backend Express

```text
Cliente / Postman
        |
        | HTTP - Puerto 3000
        v
AWS EC2 - Node.js + Express
        |
        | PostgreSQL - Puerto 5432
        v
Amazon RDS PostgreSQL privado
```

### Backend Lambda

```text
Cliente / Postman
        |
        | HTTPS - Puerto 443
        v
AWS Lambda Function URL
        |
        v
AWS Lambda - Node.js 24
        |
        | PostgreSQL - Puerto 5432
        v
Amazon RDS PostgreSQL privado
```

Ambos backends deberán utilizar la misma instancia de Amazon RDS, con acceso restringido mediante grupos de seguridad.

## 11. Seguridad

- Credenciales almacenadas en variables de entorno.
- Archivos `.env` excluidos mediante `.gitignore`.
- Paquetes ZIP de despliegue excluidos del repositorio.
- Consultas SQL parametrizadas.
- Validación de datos en los controladores.
- Base de datos independiente para pruebas.
- Compatibilidad con conexiones SSL a Amazon RDS.

### Medidas pendientes en AWS

- Restringir el acceso SSH a direcciones IP autorizadas.
- Restringir el puerto 3000 según los requisitos del laboratorio.
- Configurar Amazon RDS sin acceso público.
- Permitir conexiones al puerto 5432 únicamente desde los grupos de seguridad autorizados.
- Configurar los permisos IAM correspondientes a Lambda.
- Restringir las operaciones de escritura expuestas públicamente.

## 12. Bitácora de desarrollo e incidencias

### 12.1. Implementación inicial en AWS EC2

**Estado:** implementación inicial verificada.

Durante las primeras etapas del proyecto se consiguió establecer una conexión SSH con una instancia EC2 Ubuntu e instalar los componentes necesarios para ejecutar el backend.

Actividades realizadas:

- Instalación de Node.js 22.
- Instalación de PostgreSQL 16.
- Configuración de las bases de datos.
- Creación de tablas.
- Ejecución del backend Express.
- Ejecución exitosa de las cinco pruebas automatizadas.
- Configuración inicial del servicio mediante `systemd`.
- Verificación del funcionamiento interno de la API.

### 12.2. Incidencia INC-001 — Problemas de conectividad con AWS EC2

**Fecha de registro:** 24 de noviembre de 2026.

**Estado:** pendiente de resolución definitiva.

**Descripción del incidente:**

Durante la continuación de la Guía 18 se presentaron problemas de conectividad entre el equipo de desarrollo y las instancias EC2 de AWS Academy.

Los intentos de conexión mediante SSH al puerto 22 finalizaron por tiempo de espera agotado, impidiendo continuar con la configuración remota de la infraestructura.

**Diagnóstico realizado:**

- Intentos fallidos de conexión SSH al puerto 22 desde PowerShell, Visual Studio Code y OpenSSH.
- Pruebas mediante `Test-NetConnection` contra las direcciones públicas de EC2.
- Revisión de grupos de seguridad, reglas del puerto 22, subredes públicas, rutas hacia Internet Gateway y direcciones IP pública de EC2 y del equipo cliente.

**Resultados obtenidos:**

```text
TcpTestSucceeded : False
PingSucceeded    : False
```

```text
Connection timed out
```

PowerShell y Visual Studio Code no lograron establecer la sesión SSH y los intentos finalizaron por tiempo de espera agotado. La revisión de red no permitió confirmar una causa definitiva. Se considera como posibilidad una restricción de la red de Internet utilizada, además de factores de configuración, pero esta hipótesis no ha sido confirmada.

**Impacto en el proyecto:**

- Imposibilidad de continuar temporalmente con la configuración remota.
- Retraso en el despliegue de AWS Lambda.
- Retraso en la integración con Amazon RDS.
- Imposibilidad de completar las pruebas externas desde Postman.

### 12.3. Plan de contingencia — Desarrollo local

**Fecha:** 24 de noviembre de 2026.

Para evitar la paralización del proyecto, se decidió trasladar temporalmente el desarrollo a un entorno local utilizando Visual Studio Code, Windows, Node.js y PostgreSQL.

Actividades realizadas:

- Instalación y configuración de PostgreSQL 16.
- Creación de las bases de datos principal y de pruebas.
- Actualización de Express 4.22.3 a Express 5.3.0.
- Adaptación de la conexión PostgreSQL para entornos locales y AWS.
- Desarrollo de la función Lambda.
- Implementación de consultas y registros de productos mediante Lambda.
- Implementación local de autenticación JWT, autorización por roles y gestión de citas veterinarias en el backend Express.
- Validación cruzada entre Express y Lambda.
- Descarga del certificado SSL de Amazon RDS.
- Generación del paquete ZIP de despliegue.
- Protección de credenciales mediante `.gitignore`.
- Creación de archivos `.env.example`.
- Última ejecución local informada del backend: 22 pruebas automatizadas aprobadas y 0 fallidas. Los resultados históricos de pruebas anteriores se conservan en sus respectivos registros.

**Resultado del plan de contingencia:**

Se logró continuar con el desarrollo del proyecto sin depender temporalmente de la infraestructura de AWS, dejando los componentes preparados para su posterior despliegue.

### 12.4. Continuidad del trabajo

**Fecha prevista:** 25 de noviembre de 2026.

Se contempla retomar el trabajo desde otra red, por ejemplo la de Duoc UC, para comprobar nuevamente la conectividad con AWS. La causa del incidente sigue sin confirmación y el cambio de red constituye una prueba de diagnóstico, no una solución garantizada.

- Restablecer la conexión SSH.
- Actualizar el backend desplegado en EC2.
- Configurar Amazon RDS.
- Configurar los grupos de seguridad.
- Desplegar AWS Lambda.
- Configurar la Function URL.
- Realizar pruebas mediante Postman.
- Ejecutar la validación cruzada utilizando Amazon RDS.
- Recopilar evidencias.
- Actualizar el repositorio GitHub.

## 13. Estado del proyecto

### Desarrollo local

- [x] Backend Express.
- [x] Express 5.
- [x] Integración PostgreSQL local.
- [x] CRUD de productos.
- [x] CRUD de servicios.
- [x] Persistencia de datos.
- [x] Pruebas automatizadas.
- [x] Desarrollo de Lambda.
- [x] Validación cruzada local.
- [x] Paquete ZIP de despliegue.
- [x] Protección de credenciales.
- [x] Documentación de incidencias.

### Infraestructura AWS

- [x] Implementación inicial de Express en EC2.
- [x] Configuración inicial de systemd.
- [ ] Restablecimiento de conectividad SSH.
- [ ] Actualización de Express en EC2.
- [ ] Integración definitiva con Amazon RDS.
- [ ] Despliegue de Lambda.
- [ ] Configuración de Function URL.
- [ ] Validación cruzada en AWS.
- [ ] Pruebas externas en Postman.
- [ ] Revisión final de seguridad.
- [ ] Actualización final del repositorio.

## 14. Conclusión

El proyecto Happy Paws ha logrado implementar y verificar localmente dos backends capaces de interactuar con una misma base de datos PostgreSQL.

A pesar de los inconvenientes de conectividad con AWS EC2, se aplicó un plan de contingencia que permitió mantener la continuidad del desarrollo y preparar los componentes necesarios para su posterior despliegue.

Los resultados obtenidos corresponden a pruebas efectivamente realizadas. La integración definitiva con Amazon RDS y AWS Lambda deberá verificarse una vez restablecido el acceso a la infraestructura.

## 15. Repositorio

Proyecto académico Happy Paws — DSY1104.

## 16. Guía 19 — Arquitectura, autenticación e integración

### 16.1. Objetivo y alcance

La Guía 19 documenta la arquitectura del backend Happy Paws y su integración planificada con el frontend React. El backend expone una API REST para autenticación, productos, servicios y citas, con PostgreSQL como almacenamiento relacional. El frontend React ya existe en un repositorio separado; su conexión efectiva con esta API sigue pendiente.

### 16.2. Justificación de tecnologías

- **Node.js:** permite ejecutar el backend en JavaScript y comparte el ecosistema del frontend React.
- **Express:** proporciona el servidor HTTP y el enrutamiento REST usados por la aplicación; los módulos separan rutas, controladores, servicios y acceso a datos.
- **PostgreSQL:** persiste datos relacionales y aplica claves foráneas, restricciones e índices para mantener integridad, incluida la disponibilidad de horarios activos de citas.

### 16.3. Repositorios y documentación relacionada

- **Frontend React:** [evaluacion_2_definitiva](https://github.com/ervin-millanguir/evaluacion_2_definitiva). Existe; la integración con la API de este repositorio está pendiente.
- **Arquitectura:** [docs/arquitectura-guia19.md](docs/arquitectura-guia19.md).
- **Secuencias de autenticación y JWT:** [docs/secuencia-autenticacion-guia19.md](docs/secuencia-autenticacion-guia19.md).
- **DER en Google Drive:** [Diagrama entidad-relación de Happy Paws](https://drive.google.com/file/d/1Gkcph7PmxI6n0O2FxsV2jDYSJ9IPM5DS/view?usp=drivesdk).

### 16.4. Modelo de datos y relaciones

Las definiciones de las cinco tablas se distribuyen entre `backend/nodejs/database/auth.sql`, `schema.sql` y `citas.sql`.

| Tabla | Propósito y relaciones |
|---|---|
| `roles` | Catálogo de roles, como `CLIENTE` y `ADMIN`; un rol puede estar asociado a varios usuarios. |
| `usuarios` | Cuentas de usuario y referencia a un rol. |
| `productos` | Catálogo de productos, precios y stock; no tiene relaciones declaradas con las otras tablas en los scripts revisados. |
| `servicios` | Catálogo de servicios veterinarios; un servicio puede estar asociado a varias citas. |
| `citas` | Solicitudes veterinarias; cada cita referencia al usuario que la solicita y al servicio seleccionado. |

Relaciones principales: `roles 1:N usuarios`, `usuarios 1:N citas` y `servicios 1:N citas`. Los productos se gestionan como catálogo independiente en el esquema actual.

#### Permisos PostgreSQL pendientes en los scripts

Los tres scripts SQL crean las tablas, las secuencias `SERIAL`, restricciones e índices, pero **no contienen instrucciones `GRANT`**. Si los scripts se ejecutan con un propietario distinto de `happy_paws_app`, los permisos no se conceden automáticamente a dicho usuario. También se deben confirmar `CONNECT` en cada base de datos y `USAGE` en el esquema `public`.

Permisos mínimos de runtime sugeridos, para ejecutar por un administrador con privilegios, conectado a cada base de datos correspondiente:

```sql
GRANT CONNECT ON DATABASE happy_paws TO happy_paws_app;
GRANT CONNECT ON DATABASE happy_paws_test TO happy_paws_app;
GRANT USAGE ON SCHEMA public TO happy_paws_app;
GRANT SELECT ON TABLE roles TO happy_paws_app;
GRANT SELECT, INSERT ON TABLE usuarios TO happy_paws_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE productos, servicios TO happy_paws_app;
GRANT SELECT, INSERT, UPDATE ON TABLE citas TO happy_paws_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO happy_paws_app;
```

El bloque de permisos sobre esquema, tablas y secuencias debe ejecutarse por separado dentro de cada base de datos. Para `happy_paws_test`, se requieren además permisos `DELETE` sobre `usuarios`, `productos`, `servicios` y `citas`, ya que la suite elimina datos temporales al finalizar. Los permisos sobre secuencias futuras tampoco quedan cubiertos por los scripts actuales; si se crean nuevas tablas después de aplicar estos permisos, el propietario deberá configurar los privilegios predeterminados correspondientes. Este bloque documenta los permisos faltantes; **no se ejecutó ni se modificó la base de datos**. Si `happy_paws_app` crea y posee los objetos, PostgreSQL le otorga privilegios de propietario, pero esa condición no está establecida en los scripts.

Permiso adicional para la limpieza de datos temporales en pruebas, conectado a `happy_paws_test`:

```sql
GRANT DELETE ON TABLE usuarios, productos, servicios, citas TO happy_paws_app;
```

### 16.5. Autenticación, bcrypt, JWT y autorización

- `POST /api/auth/register` es público, valida los datos, calcula el hash de contraseña con bcrypt (12 rondas) y asigna automáticamente el rol `CLIENTE`.
- `POST /api/auth/login` es público. Compara la contraseña con bcrypt y emite un token JWT si el usuario existe, está activo y las credenciales coinciden.
- El JWT usa HS256 y tiene una duración predeterminada de una hora, configurable con `JWT_EXPIRES_IN`. La validación también comprueba firma, expiración, emisor (`JWT_ISSUER`) y audiencia (`JWT_AUDIENCE`).
- `JWT_SECRET` debe configurarse como secreto del entorno; no se incluyen valores secretos en el repositorio ni en esta guía. Se debe reemplazar cada marcador de `.env.example` en el `.env` local, que no debe versionarse.
- Las rutas protegidas autentican al usuario y aplican roles. En `GET /api/citas/:id`, `CLIENTE` solo puede consultar una cita propia; `ADMIN` puede consultar cualquier cita. Las operaciones administrativas de productos y servicios requieren `ADMIN`.
- No se implementan actualmente cierre de sesión con revocación ni renovación de JWT. La política propuesta está documentada en el documento de secuencia.
- HTTPS es requisito para el despliegue definitivo y para transmitir credenciales y tokens fuera del entorno local.

### 16.6. Endpoints y Swagger

| Método y endpoint | Acceso | Función |
|---|---|---|
| `POST /api/auth/register` | Público | Registrar usuario como `CLIENTE`. |
| `POST /api/auth/login` | Público | Iniciar sesión y obtener JWT. |
| `GET /api/auth/me` | Autenticado | Consultar perfil propio. |
| `GET /api/productos`, `GET /api/productos/:id` | Público | Consultar catálogo de productos. |
| `POST /api/productos`, `PUT /api/productos/:id`, `DELETE /api/productos/:id` | `ADMIN` | Administrar productos. |
| `GET /api/servicios`, `GET /api/servicios/:id` | Público | Consultar catálogo de servicios. |
| `POST /api/servicios`, `PUT /api/servicios/:id`, `DELETE /api/servicios/:id` | `ADMIN` | Administrar servicios. |
| `POST /api/citas` | `CLIENTE` | Solicitar cita. |
| `GET /api/citas/mis-citas` | `CLIENTE` | Listar citas propias. |
| `GET /api/citas` | `ADMIN` | Listar todas las citas. |
| `GET /api/citas/:id` | `CLIENTE` propietario o `ADMIN` | Consultar una cita, aplicando comprobación de propiedad. |
| `PATCH /api/citas/:id/estado` | `ADMIN` | Cambiar estado de una cita. |

La documentación interactiva Swagger está disponible en `/api-docs` y su especificación JSON en `/api-docs.json`, cuando el servidor local está iniciado.

### 16.7. Instalación y configuración local reproducible

Requisitos: Node.js 24, PostgreSQL 16 y las herramientas de línea de comandos `createuser`, `createdb` y `psql`.

1. Abrir PowerShell en la carpeta del backend:

   ```powershell
   Set-Location backend\nodejs
   npm ci
   if (-not (Test-Path .env)) { Copy-Item .env.example .env } else { Write-Output ".env existente conservado" }
   ```

2. Editar el archivo local `.env`. Asignar una contraseña local a `DB_PASSWORD`, generar un secreto robusto para `JWT_SECRET`, y configurar `JWT_ISSUER` y `JWT_AUDIENCE` con valores que coincidan en firma y verificación. Para desarrollo local, usar `DB_HOST=127.0.0.1`, `DB_SSL=false` y `DB_NAME=happy_paws`. No copiar los marcadores de ejemplo como secretos de producción.

3. Crear el rol y las bases de datos. `createuser` solicita la contraseña de forma interactiva:

   ```powershell
   createuser --pwprompt happy_paws_app
   createdb --owner=happy_paws_app happy_paws
   createdb --owner=happy_paws_app happy_paws_test
   ```

   Estos comandos requieren un rol PostgreSQL con privilegios para crear roles y bases de datos. Configurar `DB_PASSWORD` en `.env` con la contraseña asignada al rol.

4. Crear las cinco tablas en ambas bases de datos, desde `backend\nodejs`:

   ```powershell
   psql -U happy_paws_app -d happy_paws -f database\auth.sql
   psql -U happy_paws_app -d happy_paws -f database\schema.sql
   psql -U happy_paws_app -d happy_paws -f database\citas.sql

   psql -U happy_paws_app -d happy_paws_test -f database\auth.sql
   psql -U happy_paws_app -d happy_paws_test -f database\schema.sql
   psql -U happy_paws_app -d happy_paws_test -f database\citas.sql
   ```

   El rol que ejecute estos scripts debe ser propietario de los objetos o disponer de permisos de creación. Si la aplicación usa un rol distinto del propietario, aplicar los permisos indicados en la subsección 16.4.

5. Iniciar la API:

   ```powershell
   npm start
   ```

   La API local responde en `http://localhost:3000`. Swagger queda en `http://localhost:3000/api-docs`.

6. Ejecutar las pruebas automatizadas:

   ```powershell
   npm test
   ```

   La suite configura `happy_paws_test` y borra sus datos temporales. No ejecutar pruebas contra la base de datos de desarrollo o producción.

### 16.8. Resultado de pruebas y estado del proyecto

La última ejecución local obtuvo **22 pruebas aprobadas, 0 fallidas y 100 % de éxito**. La evidencia de esta ejecución está en [evidencias/pruebas-automatizadas-guia19.txt](evidencias/pruebas-automatizadas-guia19.txt). El archivo histórico [evidencias/pruebas-automatizadas.txt](evidencias/pruebas-automatizadas.txt) conserva un resultado anterior de **10 aprobadas y 0 fallidas**; no se deben confundir ambos registros.

| Estado | Elementos |
|---|---|
| Implementado y probado localmente según los resultados informados | API Express, autenticación y autorización, acceso a PostgreSQL local y suite automatizada; última ejecución reportada 22/22 aprobada. |
| Existente, con integración pendiente | Frontend React del repositorio externo; conexión efectiva a esta API y validación de flujos integrados. |
| Pendiente | Despliegue definitivo en AWS, integración efectiva con Amazon RDS, HTTPS y pruebas remotas de extremo a extremo; completar los permisos PostgreSQL cuando el rol de aplicación no sea propietario. |
| Propuesta, aún no implementada | Cierre de sesión con revocación y mecanismo de renovación de JWT. |

### 16.9. Planificación propuesta de dos semanas

La siguiente planificación es una propuesta de trabajo; no representa actividades completadas ni fechas comprometidas.

| Periodo | Actividades propuestas | Criterio de cierre |
|---|---|---|
| Semana 1 | Revisar el contrato de endpoints; conectar el frontend React a la API local; configurar URL de API y CORS según el origen real del frontend; integrar inicio de sesión, manejo del token y consultas/solicitudes de citas; revisar grants en una base de pruebas. | Flujos prioritarios del frontend consumen la API local y los errores de autenticación/autorización se muestran correctamente. |
| Semana 2 | Ejecutar pruebas de integración frontend-backend; corregir incompatibilidades; preparar variables y permisos para el entorno de despliegue; configurar HTTPS y AWS cuando exista conectividad; verificar integración con RDS y registrar evidencia de pruebas. | Validación de extremo a extremo documentada; cualquier tarea bloqueada por AWS queda identificada como pendiente, sin reportar resultados no ejecutados. |