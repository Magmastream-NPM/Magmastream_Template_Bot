const { InteractionType } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  run: async (client, interaction) => {
    if (interaction.type === InteractionType.ApplicationCommand) {
      const slashCommand = client.slashCommands.get(interaction.commandName);
      if (slashCommand) {
        await slashCommand.run(client, interaction);
      }
    }
  },
};
