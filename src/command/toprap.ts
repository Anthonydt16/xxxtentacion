import { CommandInteraction, EmbedBuilder, GuildMemberRoleManager } from "discord.js";
import SpotifyApi from "../model/spotify";
import Command from "./command";

class TopRap extends Command {
    interaction: CommandInteraction;
    spotifyApi: SpotifyApi;
    roleList: string[] = [];
    requiredPermissions: bigint[] = [];

    constructor(
        interaction: CommandInteraction,
        spotifyApi: SpotifyApi,
        roleList: string[],
        requiredPermissions?: bigint[]
    ) {
        super(interaction, roleList, requiredPermissions);
        this.interaction = interaction;
        this.spotifyApi = spotifyApi;
        this.roleList = roleList;
        this.run();
      }

    public async run() {
    if (this.interaction.commandName === 'toprap') {
      const hasPermission = await this.hasPermission();
      if (!hasPermission) return;
      await this.interaction.deferReply();
      const usTopTracks = await this.spotifyApi.getTopTracksByGenre('rap', 'US');
      const frTopTracks = await this.spotifyApi.getTopTracksByGenre('rap', 'FR');

      const usEmbed = new EmbedBuilder()
        .setColor(0x1db954)
        .setTitle(' :flag_us: Top 10 Rap US Tracks')
        .setDescription('Ici les top 10 titres de Rap US sur Spotify:')
        .setFooter({
          text: 'Powered by Gogodix for RapVerse',
          iconURL:
            'https://cdn.discordapp.com/icons/1272290016697258055/a_7ac23c514b4a51ace634494cd7a96a61.webp?size=96',
        });

      usEmbed.addFields(
        usTopTracks.map((track, index) => ({
          name: `${index + 1}. ${track.name}`,
          value: `by ${track.artists.map((artist) => artist.name).join(', ')}\n🔗 [Listen on Spotify](${track.external_urls.spotify})`,
        }))
      );

      const frEmbed = new EmbedBuilder()
        .setColor(0x1db954)
        .setTitle(' :flag_fr: Top 10 Rap FR Tracks')
        .setDescription('Ici les top 10 titres de Rap FR sur Spotify:')
        .setFooter({
          text: 'Powered by Gogodix for RapVerse',
          iconURL:
            'https://cdn.discordapp.com/icons/1272290016697258055/a_7ac23c514b4a51ace634494cd7a96a61.webp?size=96',
        });

      frEmbed.addFields(
        frTopTracks.map((track, index) => ({
          name: `${index + 1}. ${track.name}`,
          value: `by ${track.artists.map((artist) => artist.name).join(', ')}\n🔗 [Lien pour Spotify](${track.external_urls.spotify})`,
        }))
      );

      await this.interaction.followUp({
        content: 'Ici les top 10 titres de Rap US sur Spotify:',
        embeds: [usEmbed],
      });
      await this.interaction.followUp({
        content: 'Ici les top 10 titres de Rap FR sur Spotify:',
        embeds: [frEmbed],
      });
    }
  }
}
export default TopRap;