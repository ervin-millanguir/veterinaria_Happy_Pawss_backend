# Informe técnico — Happy Paws

## 1. Portada

- **Institución:** Duoc UC.
- **Asignatura:** DSY1104.
- **Proyecto:** Happy Paws.
- **Actividad:** Guía 18 — Node.js, Express, AWS Lambda y Amazon RDS.
- **Integrantes:** Pendiente de completar.
- **Docente:** Pendiente de completar.
- **Fecha:** Noviembre de 2026.

## 2. Introducción y objetivos

El proyecto Happy Paws contempla el desarrollo de una solución backend para la administración de productos y servicios veterinarios.

La solución utiliza dos tecnologías de procesamiento: un servidor Node.js con Express alojado en Amazon EC2 y una función AWS Lambda. Ambos componentes deberán conectarse a una misma base de datos Amazon RDS PostgreSQL.

### Objetivo general

Implementar una arquitectura cloud que permita consultar y registrar información mediante dos backends independientes conectados a una base de datos compartida.

### Objetivos específicos

- Implementar una API REST mediante Express.
- Desarrollar una función AWS Lambda utilizando Node.js.
- Implementar una base de datos PostgreSQL compartida.
- Configurar mecanismos de seguridad y conectividad.
- Verificar la interoperabilidad entre ambos backends.
- Documentar las pruebas, resultados e incidencias del proyecto.

## 3. Investigación técnica

### 3.1. Amazon RDS y PostgreSQL

Amazon RDS es un servicio administrado de bases de datos relacionales que facilita tareas como mantenimiento, respaldos y actualizaciones.

A diferencia de PostgreSQL instalado directamente en EC2, RDS permite reducir las responsabilidades de administración de la infraestructura de base de datos.

### 3.2. VPC y subredes

Amazon VPC permite establecer una red virtual aislada dentro de AWS.

Una subred pública dispone de una ruta hacia Internet Gateway, mientras que una subred privada no tiene una ruta directa hacia este componente.

La arquitectura propuesta considera EC2 en una subred pública y Amazon RDS en subredes privadas.

### 3.3. Grupos de seguridad

Los grupos de seguridad funcionan como mecanismos de control del tráfico de red asociado a los recursos de AWS.

Se utilizarán grupos independientes para EC2, Lambda y RDS, permitiendo únicamente las conexiones necesarias.

### 3.4. Puerto 5432 y acceso privado

PostgreSQL utiliza normalmente el puerto TCP 5432.

La instancia RDS deberá configurarse sin acceso público y aceptar conexiones exclusivamente desde los grupos de seguridad correspondientes a EC2 y Lambda.

### 3.5. IAM, conectividad y credenciales

AWS IAM permite administrar identidades, roles y permisos sobre los recursos de AWS.

Los permisos IAM no reemplazan las reglas de conectividad de red ni las credenciales de PostgreSQL.

Las credenciales de conexión se mantendrán fuera del código fuente mediante variables de entorno protegidas.

### 3.6. AWS Lambda y VPC

AWS Lambda permite ejecutar código sin administrar directamente un servidor.

Para acceder a una instancia RDS privada, Lambda deberá configurarse con subredes y grupos de seguridad compatibles con la VPC de la base de datos.

También requerirá los permisos necesarios para administrar sus interfaces de red.

La conexión de Lambda a una VPC no garantiza acceso a Internet. Si se requiere conectividad externa mediante IPv4, deberá evaluarse una salida mediante NAT.

### 3.7. Administración de conexiones PostgreSQL

La biblioteca `pg` permite establecer conexiones entre Node.js y PostgreSQL.

El uso de un pool facilita la reutilización de conexiones y reduce la necesidad de establecer una conexión nueva por cada solicitud.

En Lambda se implementó un pool con un máximo de dos conexiones por entorno de ejecución.

Amazon RDS Proxy constituye una alternativa para administrar conexiones cuando existe una mayor cantidad de ejecuciones concurrentes. Su implementación no forma parte del desarrollo actualmente verificado.

## 4. Diseño de arquitectura

La arquitectura propuesta considera dos alternativas de procesamiento conectadas a una misma base de datos.

### 4.1. Arquitectura Express

Cliente → EC2 → Express → Amazon RDS PostgreSQL.

- Comunicación HTTP mediante el puerto 3000.
- Conexión PostgreSQL mediante el puerto 5432.
- Instancia EC2 ubicada en una subred pública.
- Base de datos ubicada en subredes privadas.

### 4.2. Arquitectura Lambda

Cliente → Function URL → AWS Lambda → Amazon RDS PostgreSQL.

- Comunicación HTTPS mediante el puerto 443.
- Ejecución mediante Node.js 24.
- Conexión PostgreSQL mediante el puerto 5432.
- Acceso a RDS mediante la VPC.

Los diagramas correspondientes se encuentran en [arquitectura.md](arquitectura.md).

Ambas arquitecturas representan el diseño propuesto para el despliegue definitivo.

## 5. Implementación de Amazon RDS

### 5.1. Configuración propuesta

| Parámetro | Configuración |
|---|---|
| Motor | PostgreSQL |
| Base de datos | happy_paws |
| Puerto | 5432 |
| Acceso público | No |
| Comunicación cifrada | SSL/TLS |
| Grupo de seguridad | Exclusivo para RDS |
| Orígenes autorizados | SG de EC2 y SG de Lambda |
| Identificador | Pendiente |
| Endpoint | Pendiente |
| Versión definitiva | Pendiente |
| Tipo de instancia | Pendiente |
| Almacenamiento | Pendiente |

### 5.2. Modelo de datos

El esquema SQL se encuentra en `backend/nodejs/database/schema.sql`.

La tabla productos contiene:

| Campo | Tipo |
|---|---|
| id | SERIAL |
| nombre | VARCHAR(150) |
| precio | NUMERIC(10,2) |
| stock | INTEGER |

La tabla servicios contiene:

| Campo | Tipo |
|---|---|
| id | SERIAL |
| nombre | VARCHAR(150) |
| descripcion | TEXT |
| precio | NUMERIC(10,2) |

Ambas tablas fueron creadas y verificadas en PostgreSQL local.

**Estado:** implementación definitiva en Amazon RDS pendiente.

## 6. Integración con Amazon EC2

Durante la implementación inicial se configuró una instancia EC2 Ubuntu con Node.js 22 y PostgreSQL 16.

Se verificó el funcionamiento interno de Express y se configuró su ejecución mediante systemd.

Posteriormente, debido a problemas de conectividad SSH, el desarrollo continuó localmente.

### Configuración local actualizada

- Node.js 24.
- Express 5.3.0.
- PostgreSQL 16.
- Puerto 3000.
- CORS habilitado.
- Procesamiento de solicitudes JSON.
- Consultas SQL parametrizadas.

### Resultados de las pruebas automatizadas

| Prueba | Resultado |
|---|---|
| GET /api/saludo | Aprobada |
| CRUD de productos | Aprobada |
| Validación de producto inválido | Aprobada |
| CRUD de servicios | Aprobada |
| Validación de servicio inválido | Aprobada |

Total: cinco pruebas aprobadas y cero fallidas.

**Estado:** backend desarrollado y probado. Actualización en EC2 y conexión definitiva con RDS pendientes.

## 7. Integración con AWS Lambda

Se desarrolló una función Lambda utilizando JavaScript, Node.js y la biblioteca `pg`.

### Componentes implementados

- `index.mjs`: procesamiento de solicitudes.
- `database.mjs`: configuración de PostgreSQL.
- `test.mjs`: prueba de saludo.
- `test-db.mjs`: prueba de conexión.
- `test-productos.mjs`: registro de productos.
- `test-consulta.mjs`: consulta de productos.

### Prueba local de saludo

Código de respuesta: HTTP 200.

```json
{
  "mensaje": "Hola, Duoc UC",
  "backend": "AWS Lambda",
  "lenguaje": "Node.js"
}
```

Se generó el paquete `happy-paws-lambda.zip`, incluyendo las dependencias necesarias y el certificado SSL de Amazon RDS.

El paquete no contiene credenciales ni archivos `.env`.

**Estado:** desarrollo y pruebas locales completados. Despliegue, configuración de VPC y Function URL pendientes.

## 8. Validación cruzada

Se comprobó que ambos backends pueden acceder a una misma base de datos PostgreSQL local.

### 8.1. Registro mediante Lambda y consulta mediante Express

| Campo | Resultado |
|---|---|
| ID | 1 |
| Nombre | Alimento de prueba Lambda |
| Precio | 15990 |
| Stock | 20 |
| Registro | HTTP 201 |
| Consulta | HTTP 200 |

### 8.2. Registro mediante Express y consulta mediante Lambda

| Campo | Resultado |
|---|---|
| ID | 2 |
| Nombre | Alimento de prueba Express |
| Precio | 12990 |
| Stock | 15 |
| Consulta | HTTP 200 |

### 8.3. Resultado

Ambos backends recuperaron correctamente los registros almacenados en PostgreSQL.

La interoperabilidad fue comprobada localmente en ambas direcciones.

Se observó una diferencia en la representación del precio: Express devuelve valores numéricos, mientras que Lambda devuelve los valores NUMERIC de PostgreSQL como cadenas de texto.

La validación cruzada deberá repetirse utilizando Amazon RDS.

## 9. Resultados, dificultades y plan de contingencia

### 9.1. Incidencia INC-001

**Fecha:** 24 de noviembre de 2026.

Durante el desarrollo se presentaron problemas de conectividad con las instancias EC2 de AWS Academy.

Las conexiones SSH mediante el puerto 22 finalizaron por tiempo de espera agotado.

### Diagnóstico

- Intentos fallidos de conexión SSH al puerto 22 desde PowerShell, Visual Studio Code y OpenSSH.
- Pruebas con `Test-NetConnection` contra las direcciones públicas de las instancias EC2.
- Revisión de grupos de seguridad y reglas de entrada para SSH.
- Revisión de subredes públicas, rutas e Internet Gateway.
- Verificación de las direcciones IP públicas de EC2 y de la red cliente.

Resultados registrados:

```text
TcpTestSucceeded : False
PingSucceeded    : False
```

```text
Connection timed out
```

Los intentos desde PowerShell y Visual Studio Code no establecieron una sesión SSH; las conexiones finalizaron por tiempo de espera agotado. La revisión no permitió confirmar la causa definitiva. Una posible restricción de la red de Internet utilizada se mantiene como hipótesis por comprobar, no como causa confirmada.

### 9.2. Plan de contingencia

Para mantener la continuidad del proyecto, se decidió continuar el desarrollo utilizando Visual Studio Code y un entorno local.

Las actividades realizadas permitieron:

- Actualizar Express.
- Configurar PostgreSQL local.
- Desarrollar y probar Lambda.
- Implementar localmente autenticación JWT, autorización por roles y gestión de citas veterinarias en el backend Express.
- Ejecutar las pruebas automatizadas.
- Verificar la comunicación entre ambos backends.
- Preparar el paquete de despliegue.
- Documentar la arquitectura.
- Proteger las credenciales.

La última ejecución local informada para el backend obtuvo **22 pruebas automatizadas aprobadas y 0 fallidas**. Este resultado corresponde a la suite actual y no reemplaza los resultados históricos de cinco pruebas documentados en secciones anteriores de este informe.

Se decidió continuar el desarrollo localmente para evitar retrasos mientras se investiga la conectividad con AWS. La implementación local de Express, PostgreSQL, Lambda, autenticación JWT, roles y citas permitió avanzar sin depender de una conexión SSH disponible.

### 9.3. Resultados generales

| Actividad | Estado |
|---|---|
| Backend Express | Completado localmente |
| PostgreSQL local | Completado |
| Pruebas automatizadas | Registro histórico de 5 aprobadas; última ejecución local informada: 22 aprobadas y 0 fallidas |
| Desarrollo Lambda | Completado localmente |
| Autenticación JWT, roles y citas | Implementados localmente |
| Validación cruzada local | Completada |
| Paquete de despliegue | Preparado |
| Amazon RDS | Pendiente |
| Despliegue Lambda | Pendiente |
| Validación cruzada AWS | Pendiente |
| Pruebas externas Postman | Pendiente |

### 9.4. Evidencias

Las capturas deberán incorporarse de manera numerada, incluyendo una descripción de cada resultado.

| Evidencia | Descripción | Estado |
|---|---|---|
| E01 | Error de conexión SSH | Resultado registrado |
| E02 | Versión de Express | Resultado registrado |
| E03 | Cinco pruebas automatizadas aprobadas | Resultado registrado |
| E04 | Prueba local de saludo Lambda | Resultado registrado |
| E05 | Validación cruzada local | Resultado registrado |
| E06 | Configuración de Amazon RDS | Pendiente |
| E07 | Grupos de seguridad AWS | Pendiente |
| E08 | Despliegue de Lambda | Pendiente |
| E09 | Pruebas Postman | Pendiente |
| E10 | Validación cruzada en RDS | Pendiente |

## 10. Conclusiones y fuentes

### 10.1. Conclusiones

El desarrollo del proyecto Happy Paws permitió implementar dos backends capaces de interactuar con una misma base de datos PostgreSQL.

A pesar de las dificultades de conectividad con AWS, se aplicó un plan de contingencia que permitió mantener la continuidad del desarrollo.

Las pruebas locales demostraron el funcionamiento de las operaciones implementadas y la interoperabilidad entre Express y Lambda.

La conclusión definitiva deberá actualizarse después de comprobar el funcionamiento de la arquitectura en AWS.

### 10.2. Fuentes técnicas de referencia

- Guía 18 — DSY1104, Duoc UC.
- Documentación oficial de Amazon RDS.
- Documentación oficial de Amazon EC2.
- Documentación oficial de Amazon VPC.
- Documentación oficial de AWS Lambda.
- Documentación oficial de AWS IAM.
- Documentación oficial de PostgreSQL.
- Documentación oficial de Express.js.
- Documentación oficial de Node.js.
- Documentación de node-postgres (pg).

Las referencias bibliográficas deberán completarse con sus enlaces y fechas de consulta antes de la entrega definitiva.

## 11. Actualización de seguimiento — Guía 19 e INC-001

Esta actualización complementa el registro original de INC-001 y añade el seguimiento de la Guía 19 sin sustituir las secciones previas de este informe ni los resultados históricos.

### Estado del incidente

- Se mantienen los intentos fallidos de conexión SSH a EC2 por el puerto 22 desde PowerShell, Visual Studio Code y OpenSSH.
- `Test-NetConnection` reportó `TcpTestSucceeded : False`; las conexiones terminaron con `Connection timed out`.
- Se revisaron grupos de seguridad, subredes públicas, rutas hacia Internet Gateway y direcciones IP públicas, sin identificar una causa definitiva.
- Una restricción de la red de Internet utilizada es una posibilidad, pero no está confirmada.

### Continuidad y resultados locales

Para evitar retrasos se continuó el trabajo en el entorno local. El backend cuenta con PostgreSQL, Express, Lambda, autenticación JWT, autorización por roles y gestión de citas veterinarias. La última ejecución local informada del backend obtuvo **22 pruebas aprobadas y 0 fallidas**; las cinco pruebas registradas anteriormente en este informe se conservan como antecedente histórico.

### Próximas acciones pendientes

Se propone reintentar la conexión desde otra red, por ejemplo la red de Duoc UC. Este intento permitirá recopilar nueva información, pero no garantiza por sí solo resolver la incidencia. La conexión SSH, el despliegue definitivo en AWS y la integración efectiva con Amazon RDS permanecen pendientes de verificación.

Los diagramas y el detalle de autenticación de la Guía 19 se encuentran en [arquitectura-guia19.md](arquitectura-guia19.md) y [secuencia-autenticacion-guia19.md](secuencia-autenticacion-guia19.md).