require("dotenv").config();

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