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

### Últimos resultados registrados — 24/11/2026

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

- Verificación de las direcciones IPv4 públicas.
- Revisión de subredes y rutas hacia Internet Gateway.
- Revisión de los grupos de seguridad.
- Verificación de la dirección IP pública del equipo.
- Pruebas de conectividad mediante PowerShell.
- Intentos de conexión mediante OpenSSH.

**Resultados obtenidos:**

```text
TcpTestSucceeded : False
PingSucceeded    : False
```

```text
ssh: connect to host port 22: Connection timed out
```

La causa definitiva del problema no pudo determinarse. Se consideraron posibles inconvenientes relacionados con la configuración de red, las reglas de seguridad o restricciones de conectividad de la red utilizada.

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
- Validación cruzada entre Express y Lambda.
- Descarga del certificado SSL de Amazon RDS.
- Generación del paquete ZIP de despliegue.
- Protección de credenciales mediante `.gitignore`.
- Creación de archivos `.env.example`.
- Ejecución exitosa de las pruebas automatizadas.

**Resultado del plan de contingencia:**

Se logró continuar con el desarrollo del proyecto sin depender temporalmente de la infraestructura de AWS, dejando los componentes preparados para su posterior despliegue.

### 12.4. Continuidad del trabajo

**Fecha prevista:** 25 de noviembre de 2026.

Se contempla retomar el trabajo desde las instalaciones de Duoc UC para comprobar nuevamente la conectividad con AWS y finalizar las actividades pendientes.

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
---

## EP3: autenticación, roles, CRUD de usuarios y Swagger

Se incorporó un paquete de integración para el proyecto académico. Consulte [`INTEGRACION_EP3.md`](INTEGRACION_EP3.md) antes de usarlo. **Requiere configuración de PostgreSQL y verificación final en el entorno del equipo.** No considerar completado el flujo de citas solo por tener frontend visual.
