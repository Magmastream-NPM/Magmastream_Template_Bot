const { readdirSync } = require("fs");
const { Manager } = require("magmastream");

module.exports = class Magmastream extends Manager {
  constructor(client) {
    super({
      nodes: client.config.nodes,
      send: (id, payload) => this._sendPayload(id, payload),
    });

    this.client = client;
    this._loadMagmastreamEvents();
  }

  _sendPayload(id, payload) {
    const guild = this.client.guilds.cache.get(id);
    if (guild) return guild.shard.send(payload);
  }

  _loadMagmastreamEvents() {
    let i = 0;
    readdirSync("./src/events/Magmastream/").forEach((file) => {
      const event = require(`../events/Magmastream/${file}`);
      const eventName = file.split(".")[0];
      this.on(eventName, event.bind(null, this.client));
      ++i;
    });
    this.client.logger.event(`Loaded a total of ${i} Magmastream event(s)`);
  }
};
