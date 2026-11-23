const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

const app = require("../src/app");

let server;
let baseURL;

before(async () => {
  server = app.listen(0);

  await new Promise((resolve) => {
    if (server.listening) resolve();
    else server.once("listening", resolve);
  });

  baseURL = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
});

async function request(ruta, metodo = "GET", datos) {
  const respuesta = await fetch(`${baseURL}${ruta}`, {
    method: metodo,
    ...(datos === undefined
      ? {}
      : {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datos),
        }),
  });

  return {
    status: respuesta.status,
    body: await respuesta.json(),
  };
}

test("GET /api/saludo responde correctamente", async () => {
  const respuesta = await request("/api/saludo");

  assert.equal(respuesta.status, 200);
});

test("CRUD completo de productos", async () => {
  const crear = await request("/api/productos", "POST", {
    nombre: "Alimento Premium",
    precio: 15990,
    stock: 10,
  });

  assert.equal(crear.status, 201);
  assert.equal(crear.body.nombre, "Alimento Premium");

  const id = crear.body.id;

  const buscar = await request(`/api/productos/${id}`);
  assert.equal(buscar.status, 200);
  assert.equal(buscar.body.id, id);

  const actualizar = await request(
    `/api/productos/${id}`,
    "PUT",
    { precio: 17990 }
  );

  assert.equal(actualizar.status, 200);
  assert.equal(actualizar.body.precio, 17990);

  const eliminar = await request(
    `/api/productos/${id}`,
    "DELETE"
  );

  assert.equal(eliminar.status, 200);

  const inexistente = await request(`/api/productos/${id}`);
  assert.equal(inexistente.status, 404);
});

test("Validación de producto inválido", async () => {
  const respuesta = await request("/api/productos", "POST", {
    nombre: "",
    precio: -100,
    stock: -1,
  });

  assert.equal(respuesta.status, 400);
});

test("CRUD completo de servicios", async () => {
  const crear = await request("/api/servicios", "POST", {
    nombre: "Consulta Veterinaria",
    descripcion: "Evaluación general",
    precio: 25000,
  });

  assert.equal(crear.status, 201);
  assert.equal(crear.body.nombre, "Consulta Veterinaria");

  const id = crear.body.id;

  const buscar = await request(`/api/servicios/${id}`);
  assert.equal(buscar.status, 200);
  assert.equal(buscar.body.id, id);

  const actualizar = await request(
    `/api/servicios/${id}`,
    "PUT",
    { precio: 30000 }
  );

  assert.equal(actualizar.status, 200);
  assert.equal(actualizar.body.precio, 30000);

  const eliminar = await request(
    `/api/servicios/${id}`,
    "DELETE"
  );

  assert.equal(eliminar.status, 200);

  const inexistente = await request(`/api/servicios/${id}`);
  assert.equal(inexistente.status, 404);
});

test("Validación de servicio inválido", async () => {
  const respuesta = await request("/api/servicios", "POST", {
    nombre: "",
    descripcion: "",
    precio: -100,
  });

  assert.equal(respuesta.status, 400);
});
