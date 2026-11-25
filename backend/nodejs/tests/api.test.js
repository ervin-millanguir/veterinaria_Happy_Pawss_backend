const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("node:crypto");

if (!["localhost", "127.0.0.1"].includes(process.env.DB_HOST)) {
  throw new Error(
    "Pruebas canceladas: DB_HOST debe ser localhost o 127.0.0.1"
  );
}

if (process.env.DB_NAME !== "happy_paws_test") {
  throw new Error(
    "Pruebas canceladas: DB_NAME debe ser happy_paws_test"
  );
}

process.env.JWT_ISSUER = process.env.JWT_ISSUER || "happy-paws-api";
process.env.JWT_AUDIENCE = process.env.JWT_AUDIENCE || "happy-paws-client";

const app = require("../src/app");
const pool = require("../src/config/database");

let server;
let baseURL;
let adminToken;
let clienteToken;
let segundoClienteToken;
let usuarioRegistradoId;
let usuarioCrudId;
let usuarioCrudRut;
let tokenRegistrado;
let servicioPruebaId;
let citaPruebaId;

const usuariosPrueba = [];
const serviciosPrueba = [];
const productosPrueba = [];

const datosRegistro = {
  nombre: "Cliente",
  apellido: "Prueba",
  rut: `${Math.floor(10000000 + Math.random() * 90000000)}-K`,
  correo: `${randomUUID()}@example.com`,
  telefono: "912345678",
  contrasena: randomUUID()
};

// ========================================
// CONFIGURACION DE USUARIOS Y TOKENS
// ========================================

async function crearUsuarioPrueba(rol) {
  const identificador = randomUUID();
  const hash = await bcrypt.hash(randomUUID(), 12);

  const resultado = await pool.query(
    `INSERT INTO usuarios
      (nombre, apellido, rut, correo, telefono, contrasena_hash, rol_id)
     VALUES ($1, $2, $3, $4, $5, $6,
       (SELECT id FROM roles WHERE nombre = $7))
     RETURNING id`,
    [
      "Usuario",
      "Prueba",
      identificador.slice(0, 15),
      `${identificador}@example.com`,
      "912345678",
      hash,
      rol
    ]
  );

  const id = resultado.rows[0].id;
  usuariosPrueba.push(id);

  return jwt.sign(
    {
      sub: String(id),
      rol
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "1h",
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE
    }
  );
}

// ========================================
// PREPARACION DE LAS PRUEBAS
// ========================================

before(async () => {
  const resultado = await pool.query(
    "SELECT current_database() AS nombre"
  );

  assert.equal(
    resultado.rows[0].nombre,
    "happy_paws_test"
  );

  adminToken = await crearUsuarioPrueba("ADMIN");
  clienteToken = await crearUsuarioPrueba("CLIENTE");
  segundoClienteToken = await crearUsuarioPrueba("CLIENTE");

  server = app.listen(0);

  await new Promise((resolve) => {
    if (server.listening) resolve();
    else server.once("listening", resolve);
  });

  baseURL = `http://127.0.0.1:${server.address().port}`;
});

// ========================================
// LIMPIEZA DE DATOS TEMPORALES
// ========================================

after(async () => {
  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await pool.query(
      "DELETE FROM citas WHERE usuario_id = ANY($1::integer[])",
      [usuariosPrueba]
    );

    await pool.query(
      "DELETE FROM servicios WHERE id = ANY($1::integer[])",
      [serviciosPrueba]
    );

    await pool.query(
      "DELETE FROM productos WHERE id = ANY($1::integer[])",
      [productosPrueba]
    );

    await pool.query(
      "DELETE FROM usuarios WHERE id = ANY($1::integer[])",
      [usuariosPrueba]
    );

  } finally {
    await pool.end();
  }
});

// ========================================
// FUNCION PARA SOLICITUDES HTTP
// ========================================

async function request(ruta, metodo = "GET", datos, token) {
  const headers = {};

  if (datos !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const respuesta = await fetch(`${baseURL}${ruta}`, {
    method: metodo,
    headers,
    ...(datos === undefined
      ? {}
      : { body: JSON.stringify(datos) })
  });

  return {
    status: respuesta.status,
    body: respuesta.status === 204
      ? null
      : await respuesta.json()
  };
}

// ========================================
// TEST 1: SALUDO
// ========================================

test("GET /api/saludo responde correctamente", async () => {
  const respuesta = await request("/api/saludo");

  assert.equal(respuesta.status, 200);
});

// ========================================
// TEST 2: CRUD PRODUCTOS
// ========================================

test("CRUD completo de productos", async () => {
  const crear = await request("/api/productos", "POST", {
    nombre: "Alimento Premium",
    precio: 15990,
    stock: 10
  }, adminToken);

  if (crear.status === 201) {
    productosPrueba.push(crear.body.id);
  }

  assert.equal(crear.status, 201);
  assert.equal(crear.body.nombre, "Alimento Premium");

  const id = crear.body.id;

  const buscar = await request(`/api/productos/${id}`);

  assert.equal(buscar.status, 200);
  assert.equal(buscar.body.id, id);

  const actualizar = await request(
    `/api/productos/${id}`,
    "PUT",
    { precio: 17990 },
    adminToken
  );

  assert.equal(actualizar.status, 200);
  assert.equal(actualizar.body.precio, 17990);

  const eliminar = await request(
    `/api/productos/${id}`,
    "DELETE",
    undefined,
    adminToken
  );

  assert.equal(eliminar.status, 200);

  const inexistente = await request(`/api/productos/${id}`);

  assert.equal(inexistente.status, 404);
});

// ========================================
// TEST 3: PRODUCTO INVALIDO
// ========================================

test("Validacion de producto invalido", async () => {
  const respuesta = await request("/api/productos", "POST", {
    nombre: "",
    precio: -100,
    stock: -1
  }, adminToken);

  assert.equal(respuesta.status, 400);
});

// ========================================
// TEST 4: CRUD SERVICIOS
// ========================================

test("CRUD completo de servicios", async () => {
  const crear = await request("/api/servicios", "POST", {
    nombre: "Consulta Veterinaria",
    descripcion: "Evaluacion general",
    precio: 25000
  }, adminToken);

  if (crear.status === 201) {
    serviciosPrueba.push(crear.body.id);
  }

  assert.equal(crear.status, 201);
  assert.equal(crear.body.nombre, "Consulta Veterinaria");

  const id = crear.body.id;

  const buscar = await request(`/api/servicios/${id}`);

  assert.equal(buscar.status, 200);
  assert.equal(buscar.body.id, id);

  const actualizar = await request(
    `/api/servicios/${id}`,
    "PUT",
    { precio: 30000 },
    adminToken
  );

  assert.equal(actualizar.status, 200);
  assert.equal(actualizar.body.precio, 30000);

  const eliminar = await request(
    `/api/servicios/${id}`,
    "DELETE",
    undefined,
    adminToken
  );

  assert.equal(eliminar.status, 200);

  const inexistente = await request(`/api/servicios/${id}`);

  assert.equal(inexistente.status, 404);
});

// ========================================
// TEST 5: SERVICIO INVALIDO
// ========================================

test("Validacion de servicio invalido", async () => {
  const respuesta = await request("/api/servicios", "POST", {
    nombre: "",
    descripcion: "",
    precio: -100
  }, adminToken);

  assert.equal(respuesta.status, 400);
});

// ========================================
// TEST 6: SOLICITUD SIN TOKEN
// ========================================

test("Rechazar solicitud sin token", async () => {
  const respuesta = await request("/api/productos", "POST", {
    nombre: "Producto prueba",
    precio: 1000,
    stock: 5
  });

  assert.equal(respuesta.status, 401);
});

// ========================================
// TEST 7: TOKEN INVALIDO
// ========================================

test("Rechazar token invalido", async () => {
  const respuesta = await request(
    "/api/auth/me",
    "GET",
    undefined,
    "token-invalido"
  );

  assert.equal(respuesta.status, 401);
});

// ========================================
// TEST 8: CLIENTE SIN PERMISOS
// ========================================

test("Impedir que un cliente registre productos", async () => {
  const respuesta = await request("/api/productos", "POST", {
    nombre: "Producto prueba",
    precio: 1000,
    stock: 5
  }, clienteToken);

  assert.equal(respuesta.status, 403);
});

// ========================================
// TEST 9: REGISTRO CORRECTO
// ========================================

test("Registrar usuario correctamente", async () => {
  const respuesta = await request(
    "/api/auth/register",
    "POST",
    datosRegistro
  );

  if (respuesta.status === 201) {
    usuarioRegistradoId = respuesta.body.usuario.id;
    usuariosPrueba.push(usuarioRegistradoId);
  }

  assert.equal(respuesta.status, 201);
  assert.ok(usuarioRegistradoId);
  assert.equal(respuesta.body.usuario.correo, datosRegistro.correo);
  assert.equal(respuesta.body.usuario.contrasena_hash, undefined);
});

// ========================================
// TEST 10: CORREO DUPLICADO
// ========================================

test("Rechazar correo duplicado", async () => {
  const respuesta = await request(
    "/api/auth/register",
    "POST",
    datosRegistro
  );

  assert.equal(respuesta.status, 409);
});

// ========================================
// TEST 11: RUT DUPLICADO
// ========================================

test("Rechazar RUT duplicado", async () => {
  const respuesta = await request(
    "/api/auth/register",
    "POST",
    {
      ...datosRegistro,
      correo: `${randomUUID()}@example.com`
    }
  );

  assert.equal(respuesta.status, 409);
});

// ========================================
// TEST 12: REGISTRO INVALIDO
// ========================================

test("Rechazar registro con datos invalidos", async () => {
  const respuesta = await request(
    "/api/auth/register",
    "POST",
    {
      nombre: "",
      apellido: "",
      rut: "123",
      correo: "correo-invalido",
      telefono: "123",
      contrasena: "123"
    }
  );

  assert.equal(respuesta.status, 400);
});

// ========================================
// TEST 13: INICIO DE SESION CORRECTO
// ========================================

test("Iniciar sesion correctamente", async () => {
  const respuesta = await request(
    "/api/auth/login",
    "POST",
    {
      correo: datosRegistro.correo,
      contrasena: datosRegistro.contrasena
    }
  );

  assert.equal(respuesta.status, 200);
  assert.ok(respuesta.body.token);
  assert.equal(respuesta.body.usuario.rol, "CLIENTE");

  tokenRegistrado = respuesta.body.token;
});

// ========================================
// TEST 14: CONTRASENA INCORRECTA
// ========================================

test("Rechazar contrasena incorrecta", async () => {
  const respuesta = await request(
    "/api/auth/login",
    "POST",
    {
      correo: datosRegistro.correo,
      contrasena: "Incorrecta123!"
    }
  );

  assert.equal(respuesta.status, 401);
});

// ========================================
// TEST 15: PERFIL AUTENTICADO
// ========================================

test("Consultar perfil autenticado", async () => {
  const respuesta = await request(
    "/api/auth/me",
    "GET",
    undefined,
    tokenRegistrado
  );

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.id, usuarioRegistradoId);
  assert.equal(respuesta.body.rol, "CLIENTE");
  assert.equal(respuesta.body.contrasena_hash, undefined);
});

// ========================================
// TEST 16: TOKEN EXPIRADO
// ========================================

test("Rechazar token expirado", async () => {
  const tokenExpirado = jwt.sign(
    {
      sub: String(usuarioRegistradoId),
      rol: "CLIENTE"
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: -60,
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE
    }
  );

  const respuesta = await request(
    "/api/auth/me",
    "GET",
    undefined,
    tokenExpirado
  );

  assert.equal(respuesta.status, 401);
});

// ========================================
// DATOS PARA PRUEBAS DE CITAS
// ========================================

const fechaFutura = new Date(
  Date.now() + 7 * 24 * 60 * 60 * 1000
).toISOString().slice(0, 10);

function datosCitaPrueba() {
  return {
    servicioId: servicioPruebaId,
    nombreMascota: "Luna",
    especie: "Perro",
    fecha: fechaFutura,
    hora: "10:30",
    motivo: "Control veterinario de prueba"
  };
}

// ========================================
// TEST 17: REGISTRAR CITA
// ========================================

test("Registrar cita veterinaria correctamente", async () => {
  const servicio = await request(
    "/api/servicios",
    "POST",
    {
      nombre: "Consulta automatizada",
      descripcion: "Servicio temporal para pruebas",
      precio: 15000
    },
    adminToken
  );

  if (servicio.status === 201) {
    servicioPruebaId = servicio.body.id;
    serviciosPrueba.push(servicioPruebaId);
  }

  assert.equal(servicio.status, 201);

  const respuesta = await request(
    "/api/citas",
    "POST",
    datosCitaPrueba(),
    clienteToken
  );

  assert.equal(respuesta.status, 201);
  assert.equal(respuesta.body.estado, "Pendiente");
  assert.equal(respuesta.body.nombreMascota, "Luna");

  citaPruebaId = respuesta.body.id;

  assert.ok(citaPruebaId);
});

// ========================================
// TEST 18: HORARIO DUPLICADO
// ========================================

test("Rechazar cita con horario ocupado", async () => {
  const respuesta = await request(
    "/api/citas",
    "POST",
    datosCitaPrueba(),
    segundoClienteToken
  );

  assert.equal(respuesta.status, 409);
});

// ========================================
// TEST 19: CONSULTAR CITAS PROPIAS
// ========================================

test("Consultar citas propias correctamente", async () => {
  const respuesta = await request(
    "/api/citas/mis-citas",
    "GET",
    undefined,
    clienteToken
  );

  assert.equal(respuesta.status, 200);
  assert.ok(Array.isArray(respuesta.body));

  assert.ok(
    respuesta.body.some(cita => cita.id === citaPruebaId)
  );
});

// ========================================
// TEST 20: ACCESO A CITAS AJENAS
// ========================================

test("Impedir acceso a citas de otro cliente", async () => {
  const respuesta = await request(
    `/api/citas/${citaPruebaId}`,
    "GET",
    undefined,
    segundoClienteToken
  );

  assert.equal(respuesta.status, 403);
});

// ========================================
// TEST 21: ADMINISTRADOR CONFIRMA CITA
// ========================================

test("Permitir al administrador actualizar una cita", async () => {
  const respuesta = await request(
    `/api/citas/${citaPruebaId}/estado`,
    "PATCH",
    {
      estado: "Confirmada"
    },
    adminToken
  );

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.estado, "Confirmada");
});

// ========================================
// TEST 22: CLIENTE SIN PERMISOS
// ========================================

test("Impedir que un cliente actualice una cita", async () => {
  const respuesta = await request(
    `/api/citas/${citaPruebaId}/estado`,
    "PATCH",
    {
      estado: "Cancelada"
    },
    clienteToken
  );

  assert.equal(respuesta.status, 403);
});

// ========================================
// TEST 23: LISTAR USUARIOS
// ========================================

test("Listar usuarios requiere rol administrador", async () => {
  const respuesta = await request(
    "/api/usuarios",
    "GET",
    undefined,
    adminToken
  );

  assert.equal(respuesta.status, 200);
  assert.ok(Array.isArray(respuesta.body));
  assert.ok(
    respuesta.body.every(usuario =>
      !("contrasena" in usuario) &&
      !("contrasena_hash" in usuario)
    )
  );
});

// ========================================
// TEST 24: CREAR USUARIO DESDE EL CRUD
// ========================================

test("Crear usuario administrativo conserva RUT y teléfono", async () => {
  const rut = `${Math.floor(10000000 + Math.random() * 90000000)}-K`;
  const respuesta = await request(
    "/api/usuarios",
    "POST",
    {
      nombre: "Usuario CRUD",
      apellido: "Prueba",
      rut,
      correo: `${randomUUID()}@example.com`,
      telefono: "+56912345678",
      contrasena: randomUUID(),
      rol: "dueno_mascota"
    },
    adminToken
  );

  assert.equal(respuesta.status, 201);
  assert.equal(respuesta.body.rut, rut);
  assert.equal(respuesta.body.telefono, "+56912345678");
  assert.equal(respuesta.body.rol, "dueno_mascota");
  assert.equal(respuesta.body.contrasena, undefined);
  assert.equal(respuesta.body.contrasena_hash, undefined);

  usuarioCrudId = respuesta.body.id;
  usuarioCrudRut = rut;
  usuariosPrueba.push(usuarioCrudId);
});

// ========================================
// TEST 25: PROPIETARIO ACTUALIZA SU PERFIL
// ========================================

test("Usuario actualiza datos propios sin perder RUT", async () => {
  const consulta = await request(
    `/api/usuarios/${usuarioRegistradoId}`,
    "GET",
    undefined,
    tokenRegistrado
  );

  assert.equal(consulta.status, 200);
  assert.equal(consulta.body.rut, datosRegistro.rut);
  assert.equal(consulta.body.telefono, datosRegistro.telefono);

  const actualizar = await request(
    `/api/usuarios/${usuarioRegistradoId}`,
    "PUT",
    { telefono: "+56987654321" },
    tokenRegistrado
  );

  assert.equal(actualizar.status, 200);
  assert.equal(actualizar.body.rut, datosRegistro.rut);
  assert.equal(actualizar.body.telefono, "+56987654321");

  const modificarRol = await request(
    `/api/usuarios/${usuarioRegistradoId}`,
    "PUT",
    { rol: "ADMIN" },
    tokenRegistrado
  );

  assert.equal(modificarRol.status, 403);
});

// ========================================
// TEST 26: ADMIN ACTUALIZA Y DESACTIVA USUARIO
// ========================================

test("Administrador actualiza rol y desactiva usuario", async () => {
  const actualizar = await request(
    `/api/usuarios/${usuarioCrudId}`,
    "PUT",
    { rol: "CLIENTE" },
    adminToken
  );

  assert.equal(actualizar.status, 200);
  assert.equal(actualizar.body.rol, "CLIENTE");
  assert.equal(actualizar.body.rut, usuarioCrudRut);
  assert.equal(actualizar.body.telefono, "+56912345678");

  const desactivar = await request(
    `/api/usuarios/${usuarioCrudId}`,
    "DELETE",
    undefined,
    adminToken
  );

  assert.equal(desactivar.status, 204);

  const resultado = await pool.query(
    "SELECT activo FROM usuarios WHERE id = $1",
    [usuarioCrudId]
  );

  assert.equal(resultado.rows[0].activo, false);
});

// ========================================
// TEST 27: REGISTRO EP3 COMPATIBLE
// ========================================

test("Ruta EP3 registra usuario con rol de dueño sin RUT ni teléfono", async () => {
  const correo = `${randomUUID()}@example.com`;
  const contrasena = randomUUID();
  const respuesta = await request(
    "/api/auth/registro",
    "POST",
    {
      nombre: "Dueño",
      apellido: "Prueba",
      correo,
      contrasena
    }
  );

  assert.equal(respuesta.status, 201);
  assert.equal(respuesta.body.usuario.rol, "dueno_mascota");
  assert.equal(respuesta.body.usuario.rut, null);
  assert.equal(respuesta.body.usuario.telefono, null);
  assert.equal(respuesta.body.usuario.contrasena_hash, undefined);
  usuariosPrueba.push(respuesta.body.usuario.id);

  const usuarioDB = await pool.query(
    `SELECT contrasena_hash, contrasena
     FROM usuarios
     WHERE id = $1`,
    [respuesta.body.usuario.id]
  );

  assert.equal(
    usuarioDB.rows[0].contrasena_hash,
    usuarioDB.rows[0].contrasena
  );
  assert.ok(await bcrypt.compare(contrasena, usuarioDB.rows[0].contrasena_hash));

  const login = await request(
    "/api/auth/login",
    "POST",
    { correo, contrasena }
  );
  assert.equal(login.status, 200);

  const cita = await request(
    "/api/citas",
    "POST",
    { ...datosCitaPrueba(), hora: "12:00" },
    login.body.token
  );
  assert.equal(cita.status, 201);
  assert.equal(cita.body.usuarioId, respuesta.body.usuario.id);
});

// ========================================
// TEST 28: SWAGGER COMPATIBLE
// ========================================

test("Swagger responde en las rutas anterior y EP3", async () => {
  const anterior = await request("/api-docs.json");
  const ep3 = await request("/api/docs.json");

  assert.equal(anterior.status, 200);
  assert.equal(ep3.status, 200);
  assert.ok(anterior.body.paths["/api/citas"]);
  assert.ok(ep3.body.paths["/api/usuarios"]);

  const [paginaAnterior, paginaEP3] = await Promise.all([
    fetch(`${baseURL}/api-docs`),
    fetch(`${baseURL}/api/docs`)
  ]);
  assert.equal(paginaAnterior.status, 200);
  assert.equal(paginaEP3.status, 200);
});

test("Rechazar JWT sin expiración, con emisor o audiencia incorrectos", async () => {
  const opcionesValidas = {
    algorithm: "HS256",
    expiresIn: "1h",
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE
  };
  const tokensInvalidos = [
    jwt.sign(
      { sub: String(usuarioRegistradoId), rol: "CLIENTE" },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
      }
    ),
    jwt.sign(
      { sub: String(usuarioRegistradoId), rol: "CLIENTE" },
      process.env.JWT_SECRET,
      { ...opcionesValidas, issuer: "otro-emisor" }
    ),
    jwt.sign(
      { sub: String(usuarioRegistradoId), rol: "CLIENTE" },
      process.env.JWT_SECRET,
      { ...opcionesValidas, audience: "otra-audiencia" }
    )
  ];

  for (const token of tokensInvalidos) {
    const respuesta = await request(
      "/api/auth/me",
      "GET",
      undefined,
      token
    );

    assert.equal(respuesta.status, 401);
  }
});