module.exports = {
  name: "ready",
  run: async (client) => {
    client.logger.ready(`${client.user.username} is now Online!`);
    client.manager.init(client.user.id);
  },
};
