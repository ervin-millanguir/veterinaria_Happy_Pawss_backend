import { handler } from "./index.mjs";

const resultado = await handler({
  queryStringParameters: {
    nombre: "Duoc UC",
  },
});

console.log(resultado.statusCode);
console.log(JSON.parse(resultado.body));