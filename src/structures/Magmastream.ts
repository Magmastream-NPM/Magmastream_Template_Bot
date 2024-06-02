import MagmastreamTemplateBot from "./Client";

import { readdirSync } from "fs";
import { Manager, ManagerEvents, Payload } from "magmastream";

export default class Magmastream extends Manager {
  client: MagmastreamTemplateBot;
  constructor(client: MagmastreamTemplateBot) {
    super({
      nodes: client.config.nodes,
      send: (id, payload) => this._sendPayload(id, payload),
    });

    this.client = client;
    this._loadMagmastreamEvents();
  }

  _sendPayload(id: string, payload: Payload) {
    const guild = this.client.guilds.cache.get(id);
    if (guild) return guild.shard.send(payload);
  }

  _loadMagmastreamEvents() {
    let i = 0;
    readdirSync("./dist/events/Magmastream/").forEach((file) => {
      const event = require(`../events/Magmastream/${file}`);
      const eventName = file.split(".")[0] as keyof ManagerEvents;
      this.on(eventName, event.bind(null, this.client));
      ++i;
    });
    this.client.logger.event(`Loaded a total of ${i} Magmastream event(s)`);
  }
}
