import { handler } from "./index.mjs";
import { pool } from "./database.mjs";

try {
  const resultado = await handler({
    rawPath: "/api/productos",
    requestContext: {
      http: {
        method: "POST",
      },
    },
    body: JSON.stringify({
      nombre: "Alimento de prueba Lambda",
      precio: 15990,
      stock: 20,
    }),
  });

  console.log(resultado.statusCode);
  console.log(JSON.parse(resultado.body));
} finally {
  await pool.end();
}