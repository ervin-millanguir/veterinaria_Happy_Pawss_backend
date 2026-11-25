require("dotenv").config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Debes configurar JWT_SECRET (mínimo 32 caracteres) en .env');
}

const app = require("./src/app");

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log("================================");
  console.log("   HAPPY PAWS - BACKEND API");
  console.log("================================");
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`Host: ${HOST}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log("================================");
});