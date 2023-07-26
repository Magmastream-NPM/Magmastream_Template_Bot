module.exports = (client, node) => {
  client.logger.ready(`Node "${node.options.identifier}" connected.`);
};
