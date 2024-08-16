import {
  EmbedBuilder,
  TextChannel,
} from 'discord.js';
import cron from 'node-cron';
import SpotifyApi from '../model/spotify';

// Tâche cron pour exécuter tous les vendredis à 12h
// toutes les 2 minutes pour tester
// cron.schedule('*/2 * * * *', async () => {

async function releasesFridayNight(spotifyApi: SpotifyApi, channel: TextChannel) {
  cron.schedule('*/2 * * * *', async () => { 
  // cron.schedule('0 12 * * 5', async () => {
    console.log('Running weekly rap releases cron job...');

    const albums = await spotifyApi.searchReleasesFridayNight();
    if (albums.length > 0) {
      for (const album of albums) {
        const albumImageUrl =
          album.images.length > 0 ? album.images[0].url : ''; // Vérifiez s'il y a une image disponible

        const embed = new EmbedBuilder()
          .setColor(0x1db954)
          .setTitle(album.name)
          .setDescription(
            `by ${album.artists
              .map((artist) => artist.name)
              .join(
                ', '
              )}\n🔗 [Listen on Spotify](${album.external_urls.spotify})\nReleased on: **${album.release_date}**`
          )
          .setFooter({
            text: 'Powered by Gogodix for RapVerse',
            iconURL:
              'https://cdn.discordapp.com/icons/1272290016697258055/a_7ac23c514b4a51ace634494cd7a96a61.webp?size=96',
          });

        if (albumImageUrl) {
          embed.setThumbnail(albumImageUrl); // Ajouter l'image de l'album en tant que miniature
        }

        await channel.send({ embeds: [embed] });
      }

      console.log('Weekly rap releases message sent.');
    } else {
      await channel.send('No rap albums were released in the past two weeks.');
    }
    console.log('Cron job scheduled for every Friday at 12:00.');
  });
}

export { releasesFridayNight };