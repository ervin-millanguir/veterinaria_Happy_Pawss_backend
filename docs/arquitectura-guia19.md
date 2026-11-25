# Arquitectura del proyecto Happy Paws

**Asignatura:** DSY1104<br>
**Guía:** 19<br>
**Tipo de documento:** descripción de arquitectura de software

## 1. Propósito y alcance

Este documento describe la arquitectura del backend Happy Paws y su relación con el frontend React disponible en el repositorio externo [evaluacion_2_definitiva](https://github.com/ervin-millanguir/evaluacion_2_definitiva). El frontend existe, pero su integración efectiva con esta API sigue pendiente.

Los diagramas distinguen la integración pendiente del frontend respecto de los componentes existentes en este repositorio. La arquitectura AWS y la conexión definitiva con Amazon RDS también se mantienen como trabajo pendiente, según el estado documentado del proyecto.

## 2. Vista general de la arquitectura

<!-- mermaid-checked: no \n, no em-dash/en-dash, no {} in labels, subgraphs are id["label"], arrows are -->|"label"|, all subgraphs closed by end, ids unique -->
```mermaid
flowchart TD
    subgraph Cliente["Cliente"]
        React["Frontend React - integración pendiente"]
    end
    subgraph Backend["Backend implementado"]
        API["API REST - Node.js y Express"]
        Rutas["Rutas Express"]
        JWT["Autenticación JWT y autorización por roles"]
        Validaciones["Validaciones de datos"]
        Controladores["Controladores"]
        Servicios["Servicios"]
        Repositorios["Repositorios de usuarios y citas"]
        Swagger["Swagger UI y OpenAPI 3.0.3"]
    end
    subgraph Persistencia["Persistencia local"]
        Pool["Pool de conexiones pg"]
        PostgreSQL[("PostgreSQL")]
        Tablas["roles, usuarios, productos, servicios y citas"]
    end
    Pruebas["Pruebas automatizadas con Node.js"]

    React -.->|"integración pendiente mediante HTTP"| API
    API --> Rutas
    Rutas -->|"rutas protegidas"| JWT
    JWT --> Validaciones
    Rutas -->|"rutas públicas"| Validaciones
    Validaciones --> Controladores
    Controladores --> Servicios
    Servicios -->|"usuarios y citas"| Repositorios
    Servicios -->|"productos y servicios"| Pool
    Repositorios --> Pool
    Pool --> PostgreSQL
    PostgreSQL --> Tablas
    API --> Swagger
    Pruebas -.->|"prueban la API"| API
```

El backend se inicia desde `backend/nodejs/server.js`. La aplicación Express registra las rutas, middlewares generales, documentación Swagger y configuración de acceso a PostgreSQL. La comunicación con la base de datos se implementa mediante `pg` y consultas parametrizadas.

### 2.1. Componentes y responsabilidades

| Componente | Tecnología o ubicación | Responsabilidad |
|---|---|---|
| Cliente web | React en el repositorio externo [evaluacion_2_definitiva](https://github.com/ervin-millanguir/evaluacion_2_definitiva) | Interfaz existente cuya integración efectiva con esta API REST está pendiente. |
| Aplicación HTTP | Node.js y Express | Recibe solicitudes, registra middlewares y monta rutas de API y documentación. |
| Rutas | `backend/nodejs/src/routes/` | Asocia métodos y rutas HTTP con controladores y aplica autenticación, roles y validaciones cuando corresponde. |
| Autenticación | `src/middlewares/auth.middleware.js` | Verifica el JWT y obtiene el usuario activo antes de permitir el acceso a rutas protegidas. |
| Autorización | `autorizarRoles` en `auth.middleware.js` | Limita acciones según el rol del usuario autenticado, por ejemplo `CLIENTE` o `ADMIN`. |
| Validadores | `backend/nodejs/src/validators/` | Comprueban los datos de registro, inicio de sesión y citas; informan errores de entrada con HTTP 400. |
| Controladores | `backend/nodejs/src/controllers/` | Atienden solicitudes y respuestas HTTP, delegando el trabajo de negocio a los servicios. |
| Servicios | `backend/nodejs/src/services/` | Implementan las operaciones de negocio de autenticación, citas, productos y servicios. |
| Repositorios | `backend/nodejs/src/repositories/` | Encapsulan consultas de usuarios y citas. Los servicios de productos y servicios consultan `pg` directamente; no existe un repositorio separado para esos módulos. |
| Persistencia | PostgreSQL y `backend/nodejs/src/config/database.js` | Almacena las cinco tablas del sistema y recibe consultas mediante un pool de conexiones. |
| Documentación de API | Swagger UI y OpenAPI | Publica la especificación y la interfaz en `/api-docs`; la especificación JSON está disponible en `/api-docs.json`. |
| Pruebas automatizadas | Node.js Test Runner y `backend/nodejs/tests/api.test.js` | Comprueba respuestas de API, autenticación, permisos y operaciones de negocio usando una base de pruebas configurada separadamente. |

### 2.2. Tablas de PostgreSQL

Las definiciones están distribuidas entre los scripts SQL de `backend/nodejs/database/`: `auth.sql`, `schema.sql` y `citas.sql`. En conjunto, describen estas cinco tablas:

| Tabla | Responsabilidad | Relaciones relevantes |
|---|---|---|
| `roles` | Catálogo de roles, incluidos `CLIENTE` y `ADMIN`. | Referenciada por `usuarios`. |
| `usuarios` | Datos de cuenta, contacto, estado y hash de contraseña. | Tiene una referencia a `roles`. |
| `productos` | Catálogo de productos con nombre, precio y stock. | No se declara una relación con las otras tablas en el esquema revisado. |
| `servicios` | Catálogo de servicios veterinarios y sus precios. | Referenciada por `citas`. |
| `citas` | Solicitudes de atención veterinaria, mascota, fecha, hora, motivo y estado. | Referencia a `usuarios` y `servicios`; un índice único parcial impide duplicar un horario activo para un servicio. |

### 2.3. Rutas públicas y protegidas

La clasificación siguiente corresponde a las rutas registradas en los archivos revisados. Una ruta protegida requiere un JWT válido; además, las operaciones administrativas o de cliente aplican autorización por rol.

| Acceso | Rutas | Restricción o uso |
|---|---|---|
| Público | `GET /api/saludo` | Comprobación de la API. |
| Público | `GET /api/productos` y `GET /api/productos/:id` | Consulta del catálogo de productos. |
| Público | `GET /api/servicios` y `GET /api/servicios/:id` | Consulta del catálogo de servicios. |
| Público | `POST /api/auth/register` y `POST /api/auth/login` | Registro de cuenta e inicio de sesión. El registro asigna el rol `CLIENTE`. |
| Protegido | `GET /api/auth/me` | Requiere autenticación JWT. |
| Protegido, `ADMIN` | `POST /api/productos`, `PUT /api/productos/:id` y `DELETE /api/productos/:id` | Administración de productos. |
| Protegido, `ADMIN` | `POST /api/servicios`, `PUT /api/servicios/:id` y `DELETE /api/servicios/:id` | Administración de servicios. |
| Protegido, `CLIENTE` | `POST /api/citas` | Registra una cita para el usuario autenticado. |
| Protegido, `CLIENTE` | `GET /api/citas/mis-citas` | Lista las citas del usuario autenticado. |
| Protegido, `ADMIN` | `GET /api/citas` | Lista todas las citas. |
| Protegido, `CLIENTE` o `ADMIN` | `GET /api/citas/:id` | El servicio también comprueba que un cliente solo consulte sus propias citas. |
| Protegido, `ADMIN` | `PATCH /api/citas/:id/estado` | Cambia el estado de una cita. |

La interfaz Swagger se sirve en `/api-docs` y el documento JSON en `/api-docs.json`; ambas rutas se registran en la aplicación Express.

## 3. Componentes y relaciones

<!-- mermaid-checked: no \n, no em-dash/en-dash, no {} in labels, subgraphs are id["label"], arrows are -->|"label"|, all subgraphs closed by end, ids unique -->
```mermaid
flowchart LR
    subgraph cPresentacion["Presentación"]
        cReact["React - integración pendiente"]
        cRutas["Rutas Express"]
        cControlador["CitasController"]
    end
    subgraph cNegocio["Lógica de negocio"]
        cServicio["CitasService"]
    end
    subgraph cDatos["Acceso a datos"]
        cRepositorio["CitasRepository"]
        cPool["Pool pg"]
        cPostgreSQL[("PostgreSQL")]
    end
    subgraph cTransversal["Servicios transversales"]
        cJWT["Autenticación JWT y roles"]
        cValidador["Validador de citas"]
        cSwagger["Swagger UI"]
        cPruebas["Pruebas automatizadas"]
    end

    cReact -.->|"consumo REST pendiente"| cRutas
    cRutas -->|"solicitud POST /api/citas"| cJWT
    cJWT --> cValidador
    cValidador --> cControlador
    cControlador -->|"delegación"| cServicio
    cServicio -->|"operación de cita"| cRepositorio
    cRepositorio -->|"consultas parametrizadas"| cPool
    cPool --> cPostgreSQL
    cSwagger -.->|"documenta"| cRutas
    cPruebas -.->|"ejercita"| cRutas
```

En el flujo de citas, autenticación y autorización se ejecutan según el orden de middlewares definido por la ruta. El cliente React se representa únicamente como consumidor futuro: no hay evidencia de integración efectiva en el código inspeccionado.

## 4. Flujo de solicitud de una cita veterinaria

El siguiente flujo describe el comportamiento implementado para `POST /api/citas`; la comunicación desde React se marca como pendiente:

1. **Cliente React:** en la arquitectura objetivo, la interfaz enviaría una solicitud HTTP `POST /api/citas` con los datos de la mascota, el servicio, la fecha, la hora y el motivo. La solicitud incluiría `Authorization: Bearer <token>` obtenido previamente desde el inicio de sesión. La integración con React aún no está implementada.
2. **Express y enrutamiento:** Express recibe la solicitud JSON y la ruta de citas inicia la cadena de procesamiento.
3. **Autenticación JWT:** el middleware comprueba la presencia del token, verifica su firma y sus atributos configurados, y consulta al repositorio de usuarios para confirmar que la cuenta existe y está activa. Si no corresponde, responde con HTTP 401.
4. **Autorización por rol:** `autorizarRoles("CLIENTE")` permite que solo un cliente autenticado solicite la cita; un rol no autorizado recibe HTTP 403.
5. **Validación de datos:** el validador comprueba el identificador de servicio, nombre y especie de la mascota, fecha válida no anterior al día actual, formato de hora y motivo. Si hay errores, la API responde HTTP 400 con el detalle de validación.
6. **Controlador:** `citas.controller.js` obtiene el identificador del usuario desde el contexto autenticado y delega la operación al servicio de citas.
7. **Servicio:** `citas.service.js` solicita al repositorio la creación de la cita y transforma conflictos conocidos de PostgreSQL en respuestas de dominio. Una referencia inexistente produce HTTP 404; un horario activo duplicado produce HTTP 409.
8. **Repositorio y PostgreSQL:** `citas.repository.js` ejecuta un `INSERT` parametrizado en `citas`, usando los identificadores de usuario y servicio y los datos validados. Las restricciones de clave foránea y el índice único parcial protegen las relaciones y la disponibilidad del horario activo.
9. **Lectura del registro creado:** tras insertar, el repositorio consulta nuevamente la cita y la relaciona con `servicios` para incluir el nombre del servicio y los datos de respuesta.
10. **Respuesta:** el controlador devuelve HTTP 201 y el objeto de cita en JSON. En el diseño objetivo, React recibiría esa respuesta por HTTP y podría actualizar su interfaz; esa integración no se encuentra en el repositorio.

```text
React (pendiente) -> HTTP REST -> Express y rutas -> JWT y rol CLIENTE
-> validación -> controlador -> servicio -> repositorio -> PostgreSQL
-> cita creada -> JSON HTTP 201 -> React (integración pendiente)
```

## 5. Documentación y pruebas

La especificación OpenAPI se genera con `swagger-jsdoc` a partir de anotaciones en las rutas. `swagger-ui-express` publica la interfaz en `/api-docs`, y Express entrega el JSON de la especificación en `/api-docs.json`. La configuración define OpenAPI 3.0.3 y el esquema de seguridad Bearer JWT.

Las pruebas usan el ejecutor integrado de Node.js y se ubican en `backend/nodejs/tests/api.test.js`. El archivo actual contiene escenarios de API que incluyen autenticación, autorización, registros y operaciones de citas, junto con productos y servicios. El script `npm test` requiere el archivo local `.env` y se configura para usar `happy_paws_test`.

La última ejecución local informada para la suite obtuvo **22 pruebas aprobadas y 0 fallidas**. Este resultado corresponde a la ejecución más reciente reportada y se distingue de `evidencias/pruebas-automatizadas.txt`, que conserva una evidencia histórica anterior de **10 pruebas aprobadas y 0 fallidas**. No se ejecutó nuevamente la suite al actualizar este documento, para evitar cualquier modificación de la base de datos de pruebas.

## 6. Estado de implementación

| Estado | Elementos |
|---|---|
| Implementado en el backend del repositorio | API Node.js/Express; rutas de autenticación, productos, servicios y citas; middleware JWT y roles; validadores; controladores y servicios; repositorios de usuarios y citas; consultas parametrizadas; configuración de conexión PostgreSQL; scripts con las cinco tablas; documentación Swagger; pruebas automatizadas. |
| Evidencia local disponible | La última ejecución local informada obtuvo 22 pruebas aprobadas y 0 fallidas. El archivo `evidencias/pruebas-automatizadas.txt` conserva un resultado histórico distinto de 10 aprobadas y 0 fallidas. Ninguno de estos resultados demuestra por sí mismo un despliegue remoto. |
| Pendiente | Integrar efectivamente el frontend React existente en [evaluacion_2_definitiva](https://github.com/ervin-millanguir/evaluacion_2_definitiva) con esta API; desplegar y verificar la arquitectura completa en AWS, incluida la integración efectiva con Amazon RDS. |

La documentación anterior del proyecto menciona una implementación inicial de Express en EC2. Sin embargo, también identifica como pendientes la conectividad y la integración definitiva con RDS. Por ello, esta guía no considera el despliegue completo en AWS como verificado. La Guía 18 existente en `docs/arquitectura.md` se conserva sin modificaciones.

## 7. Referencias del repositorio

- [Aplicación Express](../backend/nodejs/src/app.js)
- [Rutas de citas](../backend/nodejs/src/routes/citas.routes.js)
- [Middleware de autenticación y roles](../backend/nodejs/src/middlewares/auth.middleware.js)
- [Validaciones de citas](../backend/nodejs/src/validators/citas.validator.js)
- [Controlador de citas](../backend/nodejs/src/controllers/citas.controller.js)
- [Servicio de citas](../backend/nodejs/src/services/citas.service.js)
- [Repositorio de citas](../backend/nodejs/src/repositories/citas.repository.js)
- [Configuración PostgreSQL](../backend/nodejs/src/config/database.js)
- [Especificación Swagger](../backend/nodejs/src/docs/swagger.js)
- [Esquema de productos y servicios](../backend/nodejs/database/schema.sql)
- [Esquema de roles y usuarios](../backend/nodejs/database/auth.sql)
- [Esquema de citas](../backend/nodejs/database/citas.sql)
- [Pruebas automatizadas de API](../backend/nodejs/tests/api.test.js)
- [Evidencia archivada de pruebas](../evidencias/pruebas-automatizadas.txt)
