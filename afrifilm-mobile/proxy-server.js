// Simple proxy CORS server
const corsAnywhere = require("cors-anywhere");

const host = "0.0.0.0";
const port = 8080;

// Créer un serveur proxy CORS
corsAnywhere
  .createServer({
    originWhitelist: [], // Autoriser toutes les origines
    requireHeader: ["origin", "x-requested-with"],
    removeHeaders: ["cookie", "cookie2"],
  })
  .listen(port, host, function () {
    console.log(`Serveur proxy CORS fonctionnant sur ${host}:${port}`);
    console.log(
      `Utilisez: http://localhost:${port}/http://votre-api-url pour les requêtes`
    );
  });
