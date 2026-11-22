require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("================================");
  console.log("   HAPPY PAWS - BACKEND API");
  console.log("================================");
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log("================================");
});