module.exports = async (client, player, track, payload) => {
  const channel = client.channels.cache.get(player.textChannel);

  const message = await channel.send({
    content: `### Started Playing\n \`${track.title}\``,
  });

  player.setNowPlayingMessage(message);
};
