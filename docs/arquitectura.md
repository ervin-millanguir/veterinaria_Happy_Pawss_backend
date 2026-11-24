# Arquitectura Happy Paws — Guía 18

## 1. Arquitectura Express en EC2

```mermaid
flowchart TD
    A["Cliente / Postman"] -->|"HTTP TCP 3000"| B

    subgraph AWS["AWS Cloud"]
        subgraph VPC["Amazon VPC"]
            subgraph PUBLICA["Subred pública"]
                B["EC2 - Ubuntu"]
                C["Node.js + Express 5"]
                B --> C
            end

            subgraph PRIVADA["Subredes privadas"]
                D["Amazon RDS PostgreSQL"]
                E["Tablas: productos y servicios"]
                D --> E
            end

            C -->|"TCP 5432 + SSL"| D
        end
    end
```

Express recibe las solicitudes HTTP, valida los datos
y ejecuta consultas parametrizadas sobre PostgreSQL.

El grupo de seguridad de RDS permite conexiones
desde el grupo de seguridad de EC2 por el puerto 5432.

## 2. Arquitectura AWS Lambda

```mermaid
flowchart TD
    A["Cliente / Postman"] -->|"HTTPS 443"| B

    subgraph AWS["AWS Cloud"]
        B["Lambda Function URL"]
        C["AWS Lambda - Node.js 24"]
        B --> C

        subgraph VPC["Amazon VPC"]
            D["Interfaces de red de Lambda"]
            C --> D

            subgraph PRIVADA["Subredes privadas"]
                E["Amazon RDS PostgreSQL"]
                F["Tablas: productos y servicios"]
                E --> F
            end

            D -->|"TCP 5432 + SSL"| E
        end
    end
```

Lambda procesa las solicitudes mediante su handler
y utiliza la biblioteca pg para conectarse a PostgreSQL.

El grupo de seguridad de RDS permite conexiones
desde el grupo de seguridad asignado a Lambda.

## 3. Reglas de seguridad propuestas

| Origen | Destino | Puerto |
|---|---|---|
| IP autorizada | EC2 - SSH | 22 |
| IP autorizada | EC2 - Express | 3000 |
| Cliente | Function URL | 443 |
| SG de EC2 | SG de RDS | 5432 |
| SG de Lambda | SG de RDS | 5432 |

Amazon RDS no tendrá acceso público.

## 4. Estado de implementación

La arquitectura representa el diseño final propuesto.

La comunicación entre Express, Lambda y PostgreSQL
fue validada localmente el 24 de noviembre de 2026.

La implementación definitiva en AWS se encuentra
pendiente debido a la incidencia INC-001,
registrada en el README del proyecto.