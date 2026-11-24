import { handler } from "./index.mjs";
import { pool } from "./database.mjs";

try {
  const resultado = await handler({
    rawPath: "/api/productos",
    requestContext: {
      http: {
        method: "GET",
      },
    },
  });

  console.log(resultado.statusCode);
  console.log(JSON.parse(resultado.body));
} finally {
  await pool.end();
}
