import {
  Collection,
  GuildMember,
  VoiceBasedChannel,
  VoiceState,
} from "discord.js";
import MagmastreamTemplateBot from "../../structures/Client";

export = {
  name: "voiceStateUpdate",
  run: async (
    client: MagmastreamTemplateBot,
    oldState: VoiceState,
    newState: VoiceState
  ) => {
    const guildId = newState.guild.id;
    const player = client.manager.get(guildId);
    const stateChange: {
      type: "JOIN" | "LEAVE" | "MOVE" | "";
      channel: VoiceBasedChannel | null;
      members: Collection<string, GuildMember> | null;
    } = {
      type: "",
      channel: null,
      members: null,
    };

    if (!player) {
      return newState.guild.members.me?.voice.disconnect();
    }
    if (player?.state === "CONNECTED") return;
    if (
      !newState.guild.members.cache.get(client.config.clientId)?.voice
        ?.channelId
    ) {
      return player?.destroy();
    }

    if (oldState.channel === null && newState.channel !== null) {
      stateChange.type = "JOIN";
    } else if (oldState.channel !== null && newState.channel === null) {
      stateChange.type = "LEAVE";
    } else if (oldState.channel !== null && newState.channel !== null) {
      stateChange.type = "MOVE";
    }

    if (
      newState.member?.user?.bot &&
      newState.serverMute !== oldState.serverMute
    ) {
      player.pause(newState.serverMute ?? false);
    }

    if (stateChange.type === "MOVE") {
      if (oldState.channel?.id === player.voiceChannel) {
        stateChange.type = "LEAVE";
      } else if (newState.channel?.id === player.voiceChannel) {
        stateChange.type = "JOIN";
      }
    }

    if (
      stateChange.type === "JOIN" &&
      !newState.member?.user.bot &&
      player.paused
    ) {
      player.pause(true);
    }

    stateChange.channel =
      stateChange.type === "JOIN"
        ? newState.channel
        : stateChange.type === "LEAVE"
        ? oldState.channel
        : null;

    if (!stateChange.channel || stateChange.channel.id !== player.voiceChannel)
      return;

    stateChange.members = stateChange.channel.members.filter(
      (member) => !member.user.bot
    );
  },
};
