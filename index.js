const MagmastreamTemplateBot = require("./src/structures/Client.js");

const Client = new MagmastreamTemplateBot();
Client.connect();

module.exports = Client;
