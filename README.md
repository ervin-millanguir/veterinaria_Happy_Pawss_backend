# 🐾 Happy Paws — Backend API

API REST desarrollada con Node.js, Express y PostgreSQL para la gestión de productos y servicios veterinarios de Happy Paws.

## Tecnologías utilizadas

- Node.js
- Express.js
- PostgreSQL
- JavaScript
- Git y GitHub
- AWS EC2 (Ubuntu)
- Node.js Test Runner

## Funcionalidades

### Gestión de productos

Permite:

- Registrar productos.
- Consultar todos los productos.
- Buscar productos por ID.
- Actualizar productos.
- Eliminar productos.

Cada producto contiene:

- ID
- Nombre
- Precio
- Stock

### Gestión de servicios veterinarios

Permite:

- Registrar servicios.
- Consultar todos los servicios.
- Buscar servicios por ID.
- Actualizar servicios.
- Eliminar servicios.

Cada servicio contiene:

- ID
- Nombre
- Descripción
- Precio

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/ervin-millanguir/veterinaria_Happy_Pawss_backend.git
cd veterinaria_Happy_Pawss_backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar PostgreSQL

Crear las bases de datos:

- `happy_paws`: base de datos principal.
- `happy_paws_test`: base de datos de pruebas.

Crear las tablas utilizando:

```bash
psql -U postgres -d happy_paws -f database/schema.sql
```

Repetir el procedimiento para `happy_paws_test`.

El usuario configurado en la aplicación debe disponer de permisos sobre las tablas y secuencias correspondientes.

### 4. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=happy_paws_app
DB_PASSWORD=REEMPLAZAR_CON_CONTRASENA_SEGURA
DB_NAME=happy_paws
```

**Importante:** nunca publicar el archivo `.env` en GitHub.

### 5. Iniciar el servidor

```bash
npm start
```

Por defecto, la API estará disponible en:

`http://localhost:3000`

## Endpoints

### Productos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/productos` | Listar productos |
| GET | `/api/productos/:id` | Buscar producto |
| POST | `/api/productos` | Crear producto |
| PUT | `/api/productos/:id` | Actualizar producto |
| DELETE | `/api/productos/:id` | Eliminar producto |

### Servicios

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/servicios` | Listar servicios |
| GET | `/api/servicios/:id` | Buscar servicio |
| POST | `/api/servicios` | Crear servicio |
| PUT | `/api/servicios/:id` | Actualizar servicio |
| DELETE | `/api/servicios/:id` | Eliminar servicio |

### Verificación del servidor

```text
GET /api/saludo
```

## Pruebas automatizadas

El proyecto utiliza el sistema de pruebas integrado de Node.js.

Para ejecutarlas:

```bash
npm test
```

El archivo `tests/api.test.js` configura la conexión a `happy_paws_test`.

**Antes de ejecutar las pruebas**, es necesario que:

1. Exista la base de datos `happy_paws_test`.
2. Sus tablas estén creadas.
3. El usuario de PostgreSQL tenga permisos suficientes.
4. El archivo `.env` contenga las credenciales correctas.

Las pruebas verifican:

- Respuesta del servidor.
- CRUD de productos.
- Validaciones de productos.
- CRUD de servicios.
- Validaciones de servicios.

Última verificación local realizada: **5 pruebas aprobadas y 0 fallidas**.

## Base de datos

El proyecto utiliza PostgreSQL para almacenar información de manera persistente.

El archivo `database/schema.sql` contiene la estructura de las tablas:

- `productos`
- `servicios`

Las operaciones utilizan consultas SQL parametrizadas.

## Despliegue en AWS

El backend se ha probado en una instancia EC2 con Ubuntu.

Configuración utilizada:

- Node.js 22
- PostgreSQL 16
- Express
- Puerto de aplicación 3000

Para un despliegue permanente, se recomienda utilizar un administrador de servicios como `systemd`.

Los puertos y reglas del grupo de seguridad de AWS deben configurarse de acuerdo con las necesidades del entorno.

## Seguridad

- Credenciales almacenadas en variables de entorno.
- Archivo `.env` excluido mediante `.gitignore`.
- Consultas SQL parametrizadas.
- Validación de datos en los controladores.
- Base de datos independiente para pruebas.

## Estado del proyecto

- [x] Backend Express.
- [x] Integración PostgreSQL.
- [x] CRUD de productos.
- [x] CRUD de servicios.
- [x] Persistencia de datos.
- [x] Pruebas automatizadas.
- [x] Integración con rama principal de GitHub.
- [ ] Configuración permanente del servicio en AWS.
- [ ] Revisión final de seguridad.

## Repositorio

Proyecto académico Happy Paws.

Repositorio backend:

https://github.com/ervin-millanguir/veterinaria_Happy_Pawss_backend
