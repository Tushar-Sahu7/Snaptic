const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Snaptic API",
      version: "1.0.0",
      description: "API documentation for the Snaptic Attendance System.",
      contact: {
        name: "Tushar Sahu",
        email: "sahutushar532@gmail.com"
      },
    },
    servers: [
      {
        url: "/",
        description: "Default (Current Host)",
      },
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "JWT token stored in a cookie",
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/server.js"], // Files containing annotations
};

const specs = swaggerJsdoc(options);

module.exports = specs;
