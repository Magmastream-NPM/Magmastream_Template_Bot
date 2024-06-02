import { CommandInteraction, InteractionType } from "discord.js";
import MagmastreamTemplateBot from "../../structures/Client";

export = {
  name: "interactionCreate",
  run: async (
    client: MagmastreamTemplateBot,
    interaction: CommandInteraction
  ) => {
    if (interaction.type === InteractionType.ApplicationCommand) {
      const slashCommand = client.slashCommands.get(interaction.commandName);
      if (slashCommand) {
        await slashCommand.run(client, interaction);
      }
    }
  },
};
