const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const esquema = {
  openapi: '3.0.3',
  info: { title: 'Happy Paws - API REST', version: '1.1.0',
    description: 'Autenticación, roles, CRUD de usuarios y catálogo (Node.js / Express)' },
  servers: [{ url: '/api', description: 'Mismo host que Swagger (EC2 / local)' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Registro: { type: 'object', required: ['nombre','apellido','correo','contrasena'], properties: {
        nombre: {type:'string',example:'Ana'}, apellido:{type:'string',example:'Prueba'},
        correo:{type:'string',format:'email',example:'ana.prueba@example.com'}, contrasena:{type:'string',minLength:8,format:'password'} } },
      Login: { type:'object', required:['correo','contrasena'], properties: {
        correo:{type:'string',format:'email'},contrasena:{type:'string',format:'password'} } },
      Usuario: { type:'object', properties: { id:{type:'integer'}, nombre:{type:'string'}, apellido:{type:'string'},
        rut:{type:'string'}, correo:{type:'string'}, telefono:{type:'string'},
        rol:{type:'string',enum:['ADMIN','CLIENTE','RECEPCIONISTA','administrador','recepcionista','dueno_mascota']}, activo:{type:'boolean'} } },
      CrearUsuario: { allOf:[ { $ref:'#/components/schemas/Registro' }, {type:'object', properties:{
        rut:{type:'string'}, telefono:{type:'string'},
        rol:{type:'string',enum:['ADMIN','CLIENTE','RECEPCIONISTA','administrador','recepcionista','dueno_mascota']} }} ] },
      EditarUsuario: { type:'object', properties: {
        nombre:{type:'string'},apellido:{type:'string'},rut:{type:'string'},
        correo:{type:'string',format:'email'},telefono:{type:'string'},
        rol:{type:'string',enum:['ADMIN','CLIENTE','RECEPCIONISTA','administrador','recepcionista','dueno_mascota']},activo:{type:'boolean'} } },
      Producto: { type:'object',properties:{nombre:{type:'string'},precio:{type:'number'},stock:{type:'integer'}} },
      Servicio: { type:'object',properties:{nombre:{type:'string'},descripcion:{type:'string'},precio:{type:'number'}} },
    }
  },
  paths: {}
};
const p = esquema.paths;
const body = (ref) => ({ required:true, content:{'application/json':{ schema:{$ref:'#/components/schemas/'+ref} }} });
const out = (desc) => ({ description:desc });
const idparam = [{ in:'path', name:'id',required:true,schema:{type:'integer'} }];
p['/auth/registro'] = {post:{tags:['Autenticación'],summary:'Registro público: rol dueno_mascota',requestBody:body('Registro'),responses:{201:out('Cuenta creada'),400:out('Datos inválidos'),409:out('Correo repetido')}}};
p['/auth/register'] = p['/auth/registro'];
p['/auth/login'] = {post:{tags:['Autenticación'],summary:'Iniciar sesión y obtener JWT',requestBody:body('Login'),responses:{200:out('JWT y datos de usuario'),401:out('Credenciales incorrectas')}}};
p['/auth/me'] = {get:{tags:['Autenticación'],summary:'Consultar sesión actual',security:[{bearerAuth:[]}],responses:{200:out('Sesión válida'),401:out('JWT faltante o inválido')}}};
p['/usuarios'] = {
 get:{tags:['Usuarios'],summary:'Listar usuarios (administrador)',security:[{bearerAuth:[]}],responses:{200:out('Lista'),401:out('Sin JWT'),403:out('Rol incorrecto')}},
 post:{tags:['Usuarios'],summary:'Crear usuario (administrador)',security:[{bearerAuth:[]}],requestBody:body('CrearUsuario'),responses:{201:out('Creado'),400:out('Inválido'),403:out('No autorizado'),409:out('Correo repetido')}}
};
p['/usuarios/{id}'] = {
 get:{tags:['Usuarios'],summary:'Consultar cuenta propia o cualquier cuenta como admin',security:[{bearerAuth:[]}],parameters:idparam,responses:{200:out('Usuario'),401:out('Sin JWT'),403:out('Cuenta ajena'),404:out('No existe')}},
 put:{tags:['Usuarios'],summary:'Actualizar usuario; solo admin cambia rol o activo',security:[{bearerAuth:[]}],parameters:idparam,requestBody:body('EditarUsuario'),responses:{200:out('Actualizado'),403:out('Sin permiso'),409:out('Correo repetido')}},
 delete:{tags:['Usuarios'],summary:'Desactivar usuario (baja lógica, solo admin)',security:[{bearerAuth:[]}],parameters:idparam,responses:{204:out('Desactivado'),403:out('No autorizado'),404:out('No existe')}}
};
for (const [recurso,sch] of [['productos','Producto'],['servicios','Servicio']]) {
 p['/'+recurso] = {
  get:{tags:['Catálogo'],summary:'Listar '+recurso,responses:{200:out('Listado')}},
  post:{tags:['Catálogo'],summary:'Crear '+recurso+' (admin)',security:[{bearerAuth:[]}],requestBody:body(sch),responses:{201:out('Creado'),403:out('Sin permiso')}}
 };
 p['/'+recurso+'/{id}'] = {
  get:{tags:['Catálogo'],summary:'Consultar por ID',parameters:idparam,responses:{200:out('Encontrado'),404:out('No existe')}},
  put:{tags:['Catálogo'],summary:'Actualizar (admin)',security:[{bearerAuth:[]}],parameters:idparam,requestBody:body(sch),responses:{200:out('Actualizado')}},
  delete:{tags:['Catálogo'],summary:'Eliminar (admin)',security:[{bearerAuth:[]}],parameters:idparam,responses:{200:out('Eliminado')}}
 };
}

const generado = swaggerJsdoc({
  definition: {
    openapi: esquema.openapi,
    info: esquema.info,
    servers: [{ url: '/', description: 'API REST Happy Paws' }],
    components: esquema.components
  },
  apis: [path.join(__dirname, '../routes/*.js').replace(/\\/g, '/')]
});

const rutasEP3 = Object.fromEntries(
  Object.entries(esquema.paths).map(([ruta, definicion]) => [
    `/api${ruta}`,
    definicion
  ])
);

const especificacionUnificada = {
  ...generado,
  servers: [{ url: '/', description: 'API REST Happy Paws' }],
  tags: [
    ...(generado.tags || []),
    { name: 'Usuarios', description: 'Gestión de cuentas y perfiles' }
  ],
  components: {
    ...generado.components,
    ...esquema.components,
    schemas: esquema.components.schemas
  },
  paths: {
    ...generado.paths,
    ...rutasEP3
  }
};

module.exports = {
  swaggerUi,
  esquema: especificacionUnificada
};
