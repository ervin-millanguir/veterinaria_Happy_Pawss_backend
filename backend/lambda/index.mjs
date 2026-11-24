import { pool } from "./database.mjs";

function responder(statusCode, datos) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  };
}

export const handler = async (event) => {
  const metodo = event.requestContext?.http?.method || "GET";
  const ruta = event.rawPath || "/";

  try {
    // Saludo solicitado por la guía
    if (metodo === "GET" && (ruta === "/" || ruta === "/api/saludo")) {
      const nombre = String(
        event.queryStringParameters?.nombre || "estudiante"
      ).slice(0, 60);

      return responder(200, {
        mensaje: `Hola, ${nombre}`,
        backend: "AWS Lambda",
        lenguaje: "Node.js",
      });
    }

    // Consultar productos
    if (metodo === "GET" && ruta === "/api/productos") {
      const resultado = await pool.query(
        "SELECT * FROM productos ORDER BY id"
      );

      return responder(200, resultado.rows);
    }

    // Registrar productos
    if (metodo === "POST" && ruta === "/api/productos") {
      let datos;

      try {
        datos = JSON.parse(event.body || "{}");
      } catch {
        return responder(400, { mensaje: "JSON inválido" });
      }

      const { nombre, precio, stock } = datos || {};

      if (
        typeof nombre !== "string" ||
        !nombre.trim() ||
        nombre.length > 150 ||
        typeof precio !== "number" ||
        !Number.isFinite(precio) ||
        precio < 0 ||
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        return responder(400, {
          mensaje: "Datos del producto inválidos",
        });
      }

      const resultado = await pool.query(
        `INSERT INTO productos (nombre, precio, stock)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [nombre.trim(), precio, stock]
      );

      return responder(201, resultado.rows[0]);
    }

    return responder(404, {
      mensaje: "Ruta no encontrada",
    });

  } catch (error) {
    console.error(error);

    return responder(500, {
      mensaje: "Error interno del servidor",
    });
  }
};