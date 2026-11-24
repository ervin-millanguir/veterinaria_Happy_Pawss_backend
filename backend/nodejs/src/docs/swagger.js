const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "Happy Paws API",
      version: "1.0.0",
      description:
        "API REST para la gestión de usuarios, productos y servicios de Happy Paws. Proyecto DSY1104 - Duoc UC."
    },

    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desarrollo local"
      }
    ],

    tags: [
      {
        name: "Autenticación",
        description: "Registro, inicio de sesión y perfil"
      },
      {
        name: "Productos",
        description: "Gestión del catálogo de productos"
      },
      {
        name: "Servicios",
        description: "Gestión de servicios veterinarios"
      },
      {
        name: "Saludo",
        description: "Comprobación del funcionamiento de la API"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },

  apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;