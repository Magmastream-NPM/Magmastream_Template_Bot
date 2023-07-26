module.exports = {
  name: "play",
  description: "Plays a song",
  options: [
    {
      name: "query",
      description: "Input url / song title",
      required: true,
      type: 3,
    },
  ],
  run: async (client, interaction) => {
    if (!interaction.replied || interaction.deferred) {
      await interaction.deferReply({
        ephemeral: false,
      });
    }

    const query = interaction.options.getString("query");

    if (!interaction.member.voice.channelId) {
      return await interaction.editReply({
        content: "You must be in a voice channel to use this command.",
      });
    }

    const botCurrentVoiceChannelId =
      interaction.guild?.members.me?.voice.channelId;

    if (
      botCurrentVoiceChannelId &&
      interaction.member.voice.channelId &&
      interaction.member.voice.channelId !== botCurrentVoiceChannelId
    ) {
      return await interaction.editReply({
        content: `You must be connnected to the same voice channel as me to use this command. <#${botCurrentVoiceChannelId}>`,
      });
    }

    const player = client.manager.create({
      guild: interaction.guildId,
      textChannel: interaction.channelId,
      voiceChannel: interaction.member?.voice.channelId,
      selfDeafen: true,
      volume: 100,
    });

    if (player.state !== "CONNECTED") player.connect();

    const result = await player.search(query, interaction.user);

    switch (result.loadType) {
      case "empty":
        if (!player.queue.current) player.destroy();

        return await interaction.editReply({
          content: `Load failed when searching for \`${query}\``,
        });

      case "error":
        if (!player.queue.current) player.destroy();

        return await interaction.editReply({
          content: `No matches when searching for \`${query}\``,
        });

      case "track":
        player.queue.add(result.tracks[0]);

        if (!player.playing && !player.paused && !player.queue.length) {
          await player.play();
        }

        return await interaction.editReply({
          content: `Added [${result.tracks[0].title}](${result.tracks[0].uri}) to the queue.`,
        });

      case "playlist":
        if (!result.playlist?.tracks) return;

        player.queue.add(result.playlist.tracks);

        if (
          !player.playing &&
          !player.paused &&
          player.queue.size === result.playlist.tracks.length
        ) {
          await player.play();
        }

        return await interaction.editReply({
          content: `Added [${result.playlist.name}](${query}) playlist to the queue.`,
        });

      case "search":
        player.queue.add(result.tracks[0]);
        if (!player.playing && !player.paused && !player.queue.length) {
          await player.play();
        }

        return await interaction.editReply({
          content: `Added [${result.tracks[0].title}](${result.tracks[0].uri}) to the queue.`,
        });
    }
  },
};
