import { Payload, Player, Track } from "magmastream";
import MagmastreamTemplateBot from "../../structures/Client";
import { TextChannel } from "discord.js";

export = async (
  client: MagmastreamTemplateBot,
  player: Player,
  track: Track,
  payload: Payload
) => {
  if (!player.textChannel) {
    return client.logger.error("No text channel to send track start");
  }

  const channel = client.channels.cache.get(
    player.textChannel
  ) as TextChannel | null;

  if (!channel) {
    return client.logger.error("No channel found to send track start");
  }

  const message = await channel.send({
    content: `### Started Playing\n \`${track.title}\``,
  });

  player.setNowPlayingMessage(message);
};
