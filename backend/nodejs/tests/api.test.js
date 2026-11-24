const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("node:crypto");

process.env.DB_NAME = "happy_paws_test";

const app = require("../src/app");
const pool = require("../src/config/database");

let server;
let baseURL;
let adminToken;
let clienteToken;
let segundoClienteToken;
let usuarioRegistradoId;
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
    body: await respuesta.json()
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