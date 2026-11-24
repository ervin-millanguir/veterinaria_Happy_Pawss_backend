# Checklist de despliegue — Guía 18

## 1. Recuperación de conectividad
- [ ] Iniciar AWS Academy.
- [ ] Comprobar estado de EC2.
- [ ] Verificar IPv4 pública actual.
- [ ] Actualizar IP autorizada en el grupo de seguridad.
- [ ] Comprobar conexión SSH.
- [ ] Resolver incidencia INC-001.

## 2. Repositorio
- [ ] Revisar cambios locales.
- [ ] Comprobar protección de credenciales.
- [ ] Realizar commit.
- [ ] Realizar push a GitHub.
- [ ] Actualizar repositorio en EC2.

## 3. Amazon RDS
- [ ] Crear o verificar instancia PostgreSQL.
- [ ] Deshabilitar acceso público.
- [ ] Configurar subredes privadas.
- [ ] Autorizar puerto 5432 desde EC2 y Lambda.
- [ ] Crear base de datos y tablas.
- [ ] Configurar credenciales y SSL.

## 4. Express en EC2
- [ ] Instalar dependencias actualizadas.
- [ ] Configurar variables de entorno para RDS.
- [ ] Reiniciar servicio systemd.
- [ ] Autorizar puerto 3000 desde IP autorizada.
- [ ] Verificar funcionamiento.

## 5. AWS Lambda
- [ ] Crear función con Node.js 24.
- [ ] Configurar rol IAM.
- [ ] Cargar happy-paws-lambda.zip.
- [ ] Configurar handler index.handler.
- [ ] Configurar VPC y grupos de seguridad.
- [ ] Configurar variables de entorno.
- [ ] Ejecutar pruebas desde AWS.
- [ ] Configurar Function URL.
- [ ] Proteger las operaciones de escritura.

## 6. Validación final
- [ ] Actualizar variables de Postman.
- [ ] Probar saludo Express.
- [ ] Probar saludo Lambda.
- [ ] Verificar error 404.
- [ ] Registrar producto desde Express.
- [ ] Consultar producto desde Lambda.
- [ ] Registrar producto desde Lambda.
- [ ] Consultar producto desde Express.

## 7. Entrega
- [ ] Guardar capturas de evidencias.
- [ ] Completar informe técnico.
- [ ] Completar referencias bibliográficas.
- [ ] Actualizar bitácora de incidencias.
- [ ] Actualizar README.
- [ ] Revisar seguridad.
- [ ] Realizar commit y push final.