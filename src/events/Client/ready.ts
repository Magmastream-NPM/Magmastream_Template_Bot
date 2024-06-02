import MagmastreamTemplateBot from "../../structures/Client";

export = {
  name: "ready",
  run: async (client: MagmastreamTemplateBot) => {
    client.logger.ready(`${client.user?.username} is now Online!`);
    client.manager.init(client.user?.id);
  },
};
