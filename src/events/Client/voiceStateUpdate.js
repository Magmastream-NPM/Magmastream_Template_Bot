module.exports = {
  name: "voiceStateUpdate",
  run: async (client, oldState, newState) => {
    const guildId = newState.guild.id;
    const player = client.manager.get(guildId);

    if (!player) {
      return newState.guild.members.me?.voice.disconnect();
    }

    if (player.state !== "CONNECTED") return;
    if (!newState.guild.members.me?.voice.channelId) {
      player?.destroy();
    }

    const stateChange = { type: "", channel: null };

    if (!oldState.channel && newState.channel) {
      stateChange.type = "JOIN";
    } else if (oldState.channel && !newState.channel) {
      stateChange.type = "LEAVE";
    } else if (oldState.channel && newState.channel) {
      stateChange.type = "MOVE";
    } else {
      return;
    }

    if (newState.serverMute !== oldState.serverMute) {
      player.pause(!!newState.serverMute);
    }

    if (stateChange.type === "MOVE") {
      if (oldState.channel?.id === player.voiceChannel) {
        stateChange.type = "LEAVE";
      } else if (newState.channel?.id === player.voiceChannel) {
        stateChange.type = "JOIN";
      }
    }

    stateChange.channel =
      stateChange.type === "JOIN"
        ? newState.channel
        : stateChange.type === "LEAVE"
        ? oldState.channel
        : null;

    if (
      !stateChange.channel ||
      stateChange.channel.id !== player.voiceChannel
    ) {
      return;
    }

    stateChange.members = stateChange.channel.members.filter(
      (member) => !member.user.bot
    );
  },
};
